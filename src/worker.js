const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const headers={"x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin","x-frame-options":"DENY","content-security-policy":"default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'"};
function hex(bytes){return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")}
async function hashPassword(password,salt){
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
 return hex(new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:210000,hash:"SHA-256"},key,256)));
}
function randomToken(){return hex(crypto.getRandomValues(new Uint8Array(32)))}
function cookie(request){return /(?:^|; )dn_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get("cookie")||"")?.[1]}
async function authorized(request,env){
 if(!env.SITE_DB)return false;
 const token=cookie(request);if(!token)return false;
 const digest=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token))));
 const row=await env.SITE_DB.prepare("SELECT expires_at FROM admin_sessions WHERE token_hash=?").bind(digest).first();
 return !!row&&row.expires_at>Date.now();
}
async function login(request,env){
 if(!env.SITE_DB||!env.ADMIN_PASSWORD_HASH||!env.ADMIN_PASSWORD_SALT)return json({error:"Yönetici hesabı henüz yapılandırılmadı"},503);
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 if(Number(request.headers.get("content-length")||0)>4096)return json({error:"İstek çok büyük"},413);
 let body;try{body=await request.json()}catch{return json({error:"Geçersiz istek"},400)}
 if(typeof body?.password!=="string"||body.password.length>256)return json({error:"Geçersiz giriş"},400);
 const ip=request.headers.get("cf-connecting-ip")||"unknown";
 const clientKey=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip))));
 const limit=await env.SITE_DB.prepare("SELECT attempts,blocked_until FROM admin_login_attempts WHERE client_key=?").bind(clientKey).first();
 if(limit?.blocked_until>Date.now())return json({error:"Çok fazla deneme, daha sonra tekrar deneyin"},429);
 const attempt=await hashPassword(body.password,env.ADMIN_PASSWORD_SALT);
 const a=new TextEncoder().encode(attempt),b=new TextEncoder().encode(env.ADMIN_PASSWORD_HASH);
 let difference=a.length^b.length;for(let i=0;i<Math.min(a.length,b.length);i++)difference|=a[i]^b[i];
 if(difference){
  const attempts=(limit?.blocked_until&&limit.blocked_until<Date.now())?1:(limit?.attempts||0)+1;
  const until=attempts>=5?Date.now()+15*60*1000:0;
  await env.SITE_DB.prepare("INSERT INTO admin_login_attempts(client_key,attempts,blocked_until) VALUES(?,?,?) ON CONFLICT(client_key) DO UPDATE SET attempts=excluded.attempts,blocked_until=excluded.blocked_until").bind(clientKey,attempts,until).run();
  return json({error:"Giriş başarısız"},401);
 }
 await env.SITE_DB.prepare("DELETE FROM admin_login_attempts WHERE client_key=?").bind(clientKey).run();
 const token=randomToken(),digest=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token))));
 const expiry=Date.now()+8*60*60*1000;
 await env.SITE_DB.prepare("INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)").bind(digest,expiry).run();
 return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","cache-control":"no-store","set-cookie":"dn_session="+token+"; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800"}});
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if (/^\/(?:src|migrations)(?:\/|$)/i.test(url.pathname) || /^\/(?:wrangler\.jsonc|ADMIN_SETUP\.md|\.git(?:\/|$))/i.test(url.pathname)) return json({error:"Not found"},404);
 if(request.method!=="GET"&&request.method!=="HEAD"&&!url.pathname.startsWith("/api/admin/")) return json({error:"Method not allowed"},405);
 if(url.pathname==="/admin"||url.pathname==="/admin/"){const assetUrl=new URL("/admin/index.html",url);const response=await env.ASSETS.fetch(new Request(assetUrl,request));return response;}
 if(url.pathname==="/api/admin/login"){if(request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);return login(request,env)}
 if(url.pathname==="/api/admin/logout"){if(request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);if(request.method!=="POST")return json({error:"Method not allowed"},405);const token=cookie(request);if(token&&env.SITE_DB){const digest=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token))));await env.SITE_DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(digest).run()}return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":"dn_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"}})}
 if(url.pathname.startsWith("/api/admin/")||url.pathname==="/admin"||url.pathname.startsWith("/admin/")){
  if(!(await authorized(request,env)))return json({error:"Yönetici girişi gerekli."},403);
  if(url.pathname==="/api/admin/settings"){if(request.method==="PUT"&&request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);
   if(!env.SITE_DB)return json({error:"D1 veritabanı henüz bağlanmadı."},503);
   if(request.method==="GET"){const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings").all();return json(Object.fromEntries(rows.results.map(r=>[r.key,JSON.parse(r.value)])))}
   if(request.method==="PUT"){
    if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return json({error:"JSON gerekli"},415);
    if(Number(request.headers.get("content-length"))>16384)return json({error:"İstek çok büyük"},413);
    let data;try{data=await request.json()}catch{return json({error:"Geçersiz JSON"},400)}
    if(!data||typeof data!=="object"||Array.isArray(data)||Object.keys(data).length!==1)return json({error:"Tek alan gönderin"},400);
    const [key,value]=Object.entries(data)[0];
    if(!["heroTitle","heroSubtitle","phone","whatsapp","serviceDescription"].includes(key)||typeof value!=="string"||value.length>2000)return json({error:"Geçersiz alan"},400);
    await env.SITE_DB.prepare("INSERT INTO site_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key,JSON.stringify(value)).run();
    return json({ok:true});
   }
   return json({error:"Yöntem desteklenmiyor"},405);
  }
  if(url.pathname==="/admin"||url.pathname==="/admin/")return env.ASSETS.fetch(new Request(new URL("/admin/index.html",url),request));
  return env.ASSETS.fetch(request);
 }
 if(url.pathname==="/api/site/settings"){
  if(!env.SITE_DB)return json({});
  const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings WHERE key IN ('heroTitle','heroSubtitle','phone','whatsapp','serviceDescription')").all();
  return json(Object.fromEntries(rows.results.map(r=>[r.key,JSON.parse(r.value)])));
 }
 return env.ASSETS.fetch(request);
}};
