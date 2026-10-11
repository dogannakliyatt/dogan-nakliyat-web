const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const headers={"x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin","x-frame-options":"DENY","content-security-policy":"default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'"};
function b64(s){const x=s.replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(x+"=".repeat((4-x.length%4)%4)),c=>c.charCodeAt(0))}
async function authorized(request,env){
 const token=request.headers.get("cf-access-jwt-assertion");
 if(!token||!env.CF_ACCESS_TEAM_DOMAIN||!env.CF_ACCESS_AUD)return false;
 const domain=env.CF_ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//,"").replace(/\/$/,"");
 try{
  const [a,b,c,...extra]=token.split(".");if(extra.length||!c)return false;
  const header=JSON.parse(new TextDecoder().decode(b64(a))),payload=JSON.parse(new TextDecoder().decode(b64(b)));
  if(header.alg!=="RS256"||!header.kid||payload.iss!==`https://${domain}`||!(Array.isArray(payload.aud)?payload.aud:[payload.aud]).includes(env.CF_ACCESS_AUD)||!Number.isFinite(payload.exp)||payload.exp<=Date.now()/1000||!Number.isFinite(payload.iat)||payload.iat>Date.now()/1000+60)return false;
  const r=await fetch(`https://${domain}/cdn-cgi/access/certs`,{cf:{cacheTtl:300,cacheEverything:true}});
  if(!r.ok)return false;const certs=await r.json();const jwk=certs.keys?.find(k=>k.kid===header.kid&&k.kty==="RSA");if(!jwk)return false;
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
  return await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,b64(c),new TextEncoder().encode(a+"."+b));
 }catch{return false}
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname.startsWith("/api/admin/")||url.pathname==="/admin"||url.pathname.startsWith("/admin/")){
  if(!(await authorized(request,env)))return json({error:"Yönetici erişimi yetkilendirilmedi. Cloudflare Access yapılandırılmalıdır."},403);
  if(url.pathname==="/api/admin/settings"){
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
