const ADMIN_HTML="<!doctype html><html lang=\"tr\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Doğan Nakliyat Yönetim</title><style>body{font:16px system-ui;background:#f3f6fb;color:#17263d;margin:0;padding:24px}main{max-width:740px;margin:auto}section{background:white;padding:24px;border-radius:16px;box-shadow:0 6px 24px #10213c12}label{display:block;margin:16px 0 5px;font-weight:700}input,textarea{box-sizing:border-box;width:100%;padding:12px;border:1px solid #aab8ca;border-radius:8px;font:inherit}button{margin-top:18px;background:#10213c;color:white;border:0;padding:12px 20px;border-radius:8px;cursor:pointer}#status{white-space:pre-wrap}</style></head><body><main><h1>Doğan Nakliyat — Yönetim</h1><p>Yönetici şifrenizle güvenli giriş yapın.</p><section><form id=\"loginForm\"><label for=\"password\">Yönetici şifresi</label><input id=\"password\" type=\"password\" autocomplete=\"current-password\" required><button>Giriş yap</button></form><button id=\"logout\" type=\"button\" hidden>Çıkış yap</button><form id=\"form\" hidden><label for=\"key\">Düzenlenecek alan</label><select id=\"key\"><option value=\"heroTitle\">Ana başlık</option><option value=\"heroSubtitle\">Alt başlık</option><option value=\"phone\">Telefon</option><option value=\"whatsapp\">WhatsApp</option><option value=\"serviceDescription\">Hizmet açıklaması</option></select><label for=\"value\">İçerik</label><textarea id=\"value\" rows=\"5\" maxlength=\"2000\" required></textarea><button>Kaydet</button></form><div id=\"sectionPanel\" hidden><h2>Sayfa bölümleri</h2><p>Başlık ve açıklamaları ayrı ayrı düzenle.</p><label for=\"sectionSelect\">Bölüm</label><select id=\"sectionSelect\"></select><label for=\"sectionField\">Alan</label><select id=\"sectionField\"><option value=\"title\">Başlık</option><option value=\"description\">Açıklama</option></select><label for=\"sectionValue\">İçerik</label><textarea id=\"sectionValue\" rows=\"5\" maxlength=\"1500\"></textarea><button id=\"saveSection\" type=\"button\">Bölümü kaydet</button><p id=\"sectionStatus\" role=\"status\"></p></div><p id=\"status\" role=\"status\"></p></section></main><script>const secNames={\"anasayfa\":\"Ana sayfa\",\"hizmetler\":\"Hizmetler\",\"aracimiz\":\"Aracımız\",\"bolgeler\":\"Hizmet bölgeleri\",\"nedenbiz\":\"Neden biz\",\"guzergahlar\":\"Güzergâhlar\",\"tasima-ornekleri\":\"Taşıma örnekleri\",\"turkiye-haritasi\":\"Türkiye haritası\",\"yorumlar\":\"Müşteri yorumları\",\"sss\":\"Sıkça sorulan sorular\",\"hakkimizda\":\"Hakkımızda\",\"iletisim\":\"İletişim\"};\nconst secSelect=document.querySelector(\"#sectionSelect\"),secField=document.querySelector(\"#sectionField\"),secValue=document.querySelector(\"#sectionValue\"),secStatus=document.querySelector(\"#sectionStatus\");\nfor(const [id,name] of Object.entries(secNames)){const option=document.createElement(\"option\");option.value=id;option.textContent=name;secSelect.append(option)}\nlet secData={};\nasync function loadSections(){try{const r=await fetch(\"/api/admin/sections\");if(!r.ok)throw Error(\"Bölümler okunamadı\");secData=await r.json();document.querySelector(\"#sectionPanel\").hidden=false;updateSecValue()}catch(e){secStatus.textContent=e.message}}\nfunction updateSecValue(){secValue.value=secData[secSelect.value+\":\"+secField.value]||\"\"}\nsecSelect.addEventListener(\"change\",updateSecValue);secField.addEventListener(\"change\",updateSecValue);\ndocument.querySelector(\"#saveSection\").addEventListener(\"click\",async()=>{secStatus.textContent=\"Kaydediliyor...\";try{const body={section:secSelect.value,field:secField.value,value:secValue.value};const r=await fetch(\"/api/admin/sections\",{method:\"PUT\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||\"Kaydedilemedi\");secData[body.section+\":\"+body.field]=body.value;secStatus.textContent=\"Kaydedildi\"}catch(e){secStatus.textContent=e.message}});\nconst key=document.querySelector(\"#key\"),value=document.querySelector(\"#value\"),status=document.querySelector(\"#status\");let settings={};async function load(){try{const r=await fetch(\"/api/admin/settings\",{credentials:\"same-origin\"});if(!r.ok)throw Error((await r.json()).error||\"Erişim hatası\");settings=await r.json();document.querySelector(\"#form\").hidden=false;document.querySelector(\"#loginForm\").hidden=true;document.querySelector(\"#logout\").hidden=false;status.textContent=\"\";show();loadSections()}catch(e){status.textContent=e.message}}function show(){value.value=settings[key.value]||\"\"}key.addEventListener(\"change\",show);document.querySelector(\"#form\").addEventListener(\"submit\",async e=>{e.preventDefault();status.textContent=\"Kaydediliyor...\";try{const r=await fetch(\"/api/admin/settings\",{method:\"PUT\",credentials:\"same-origin\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({[key.value]:value.value})});const data=await r.json();if(!r.ok)throw Error(data.error||\"Hata\");settings[key.value]=value.value;status.textContent=\"Kaydedildi\"}catch(e){status.textContent=e.message}});document.querySelector(\"#loginForm\").addEventListener(\"submit\",async e=>{e.preventDefault();try{const r=await fetch(\"/api/admin/login\",{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({password:document.querySelector(\"#password\").value})});if(!r.ok)throw Error(\"Giriş başarısız\");document.querySelector(\"#password\").value=\"\";await load()}catch(e){status.textContent=e.message}});document.querySelector(\"#logout\").addEventListener(\"click\",async()=>{await fetch(\"/api/admin/logout\",{method:\"POST\"});location.reload()});load();</script></body></html>";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const headers={"x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin","x-frame-options":"DENY","content-security-policy":"default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'"};
function hex(bytes){return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")}
async function hashPassword(password,salt){
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
 return hex(new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:100000,hash:"SHA-256"},key,256)));
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
 if(url.pathname==="/admin"||url.pathname==="/admin/"||url.pathname==="/admin/index.html"){
  // Serve HTML as an in-memory response to avoid the static-assets canonical redirect loop.
  return new Response(ADMIN_HTML,{status:200,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","x-frame-options":"DENY"}});
 }
 if(url.pathname==="/api/admin/login"){if(request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);return login(request,env)}
 if(url.pathname==="/api/admin/logout"){if(request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);if(request.method!=="POST")return json({error:"Method not allowed"},405);const token=cookie(request);if(token&&env.SITE_DB){const digest=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token))));await env.SITE_DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(digest).run()}return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":"dn_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"}})}
 if(url.pathname.startsWith("/api/admin/")||url.pathname==="/admin"||url.pathname.startsWith("/admin/")){
  if(!(await authorized(request,env)))return json({error:"Yönetici girişi gerekli."},403);
  if(url.pathname==="/api/admin/content"){
   if(!env.SITE_DB)return json({error:"Veritabanı bağlantısı yok"},503);
   const keys=["businessName","phone","whatsapp","email","address","hours","seoTitle","seoDescription","primaryColor","accentColor","logoUrl","bannerUrl","reviewUrl","googlePlaceId","footerText","googleReviewsStatus","hideReviews","hideGallery","showOfferForm"];
   if(request.method==="GET"){const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'content:%'").all();return json(Object.fromEntries(rows.results.map(r=>[r.key.slice(8),JSON.parse(r.value)])))}
   if(request.method==="PUT"){
    if(request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);
    if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return json({error:"JSON gerekli"},415);
    if(Number(request.headers.get("content-length")||0)>8192)return json({error:"İstek çok büyük"},413);
    let body;try{body=await request.json()}catch{return json({error:"Geçersiz JSON"},400)}
    if(!body||!keys.includes(body.key)||typeof body.value!=="string"||body.value.length>2000)return json({error:"Geçersiz değer"},400);
    const value=body.value.trim();
    if(["phone","whatsapp"].includes(body.key)&&value&&!/^\\+?[0-9 ()-]{7,24}$/.test(value))return json({error:"Geçersiz telefon"},400);
    if(body.key==="email"&&value&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value))return json({error:"Geçersiz e-posta"},400);
    if(["primaryColor","accentColor"].includes(body.key)&&value&&!/^#[0-9a-fA-F]{6}$/.test(value))return json({error:"Renk #RRGGBB biçiminde olmalı"},400);
    if(["hideReviews","hideGallery","showOfferForm"].includes(body.key)&&!["true","false",""].includes(value))return json({error:"true veya false kullanın"},400);
    if(["logoUrl","bannerUrl","reviewUrl"].includes(body.key)&&value){try{const u=new URL(value,url.origin);if(u.protocol!=="https:"||u.username||u.password||u.origin!==url.origin)return json({error:"Görsel/bağlantı aynı site altında HTTPS olmalı"},400)}catch{return json({error:"Geçersiz URL"},400)}}
    await env.SITE_DB.prepare("INSERT INTO site_settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind("content:"+body.key,JSON.stringify(value)).run();
    return json({ok:true});
   }
   return json({error:"Yöntem desteklenmiyor"},405);
  }
  if(url.pathname==="/api/admin/sections"){
   if(!env.SITE_DB)return json({error:"Veritabanı bağlantısı yok"},503);
   if(request.method==="GET"){const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'section:%'").all();return json(Object.fromEntries(rows.results.map(r=>[r.key.slice(8),JSON.parse(r.value)])))}
   if(request.method==="PUT"){
    if(request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);
    if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return json({error:"JSON gerekli"},415);
    if(Number(request.headers.get("content-length")||0)>8192)return json({error:"İstek çok büyük"},413);
    let body;try{body=await request.json()}catch{return json({error:"Geçersiz JSON"},400)}
    const allowed=["anasayfa","hizmetler","aracimiz","bolgeler","nedenbiz","guzergahlar","tasima-ornekleri","turkiye-haritasi","yorumlar","sss","hakkimizda","iletisim"];
    if(!body||!allowed.includes(body.section)||!["title","description"].includes(body.field)||typeof body.value!=="string"||body.value.length>1500)return json({error:"Geçersiz içerik"},400);
    const key="section:"+body.section+":"+body.field;
    await env.SITE_DB.prepare("INSERT INTO site_settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key,JSON.stringify(body.value)).run();
    return json({ok:true});
   }
   return json({error:"Yöntem desteklenmiyor"},405);
  }
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
 if(url.pathname==="/api/site/content"){
  if(!env.SITE_DB)return json({});
  const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'content:%'").all();
  return json(Object.fromEntries(rows.results.map(r=>[r.key.slice(8),JSON.parse(r.value)])));
 }
 if(url.pathname==="/api/site/sections"){
  if(!env.SITE_DB)return json({});
  const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'section:%'").all();
  return json(Object.fromEntries(rows.results.map(r=>[r.key.slice(8),JSON.parse(r.value)])));
 }
 if(url.pathname==="/api/site/settings"){
  if(!env.SITE_DB)return json({});
  const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings WHERE key IN ('heroTitle','heroSubtitle','phone','whatsapp','serviceDescription')").all();
  return json(Object.fromEntries(rows.results.map(r=>[r.key,JSON.parse(r.value)])));
 }
 return env.ASSETS.fetch(request);
}};
