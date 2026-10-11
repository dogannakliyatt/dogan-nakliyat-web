const ADMIN_HTML="<!doctype html><html lang=\"tr\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Doğan Nakliyat Yönetim</title><style>body{font:16px system-ui;background:#f3f6fb;color:#17263d;margin:0;padding:24px}main{max-width:740px;margin:auto}section{background:white;padding:24px;border-radius:16px;box-shadow:0 6px 24px #10213c12}label{display:block;margin:16px 0 5px;font-weight:700}input,textarea{box-sizing:border-box;width:100%;padding:12px;border:1px solid #aab8ca;border-radius:8px;font:inherit}button{margin-top:18px;background:#10213c;color:white;border:0;padding:12px 20px;border-radius:8px;cursor:pointer}#status{white-space:pre-wrap}</style></head><body><main><h1>Doğan Nakliyat — Yönetim</h1><p>Yönetici şifrenizle güvenli giriş yapın.</p><section><form id=\"loginForm\"><label for=\"password\">Yönetici şifresi</label><input id=\"password\" type=\"password\" autocomplete=\"current-password\" required><button>Giriş yap</button></form><button id=\"logout\" type=\"button\" hidden>Çıkış yap</button><form id=\"form\" hidden><label for=\"key\">Düzenlenecek alan</label><select id=\"key\"><option value=\"heroTitle\">Ana başlık</option><option value=\"heroSubtitle\">Alt başlık</option><option value=\"phone\">Telefon</option><option value=\"whatsapp\">WhatsApp</option><option value=\"serviceDescription\">Hizmet açıklaması</option></select><label for=\"value\">İçerik</label><textarea id=\"value\" rows=\"5\" maxlength=\"2000\" required></textarea><button>Kaydet</button></form><div id=\"sectionPanel\" hidden><h2>Sayfa bölümleri</h2><p>Başlık ve açıklamaları ayrı ayrı düzenle.</p><label for=\"sectionSelect\">Bölüm</label><select id=\"sectionSelect\"></select><label for=\"sectionField\">Alan</label><select id=\"sectionField\"><option value=\"title\">Başlık</option><option value=\"description\">Açıklama</option></select><label for=\"sectionValue\">İçerik</label><textarea id=\"sectionValue\" rows=\"5\" maxlength=\"1500\"></textarea><button id=\"saveSection\" type=\"button\">Bölümü kaydet</button><p id=\"sectionStatus\" role=\"status\"></p></div><div id=\"contentPanel\" hidden><h2>Firma, tasarım ve SEO</h2><p>Değişiklikler kaydedildikten sonra sitede görünür. Görseller için bu sürümde sitedeki mevcut HTTPS dosya adreslerini kullan.</p><label for=\"contentKey\">Düzenlenecek ayar</label><select id=\"contentKey\"></select><label for=\"contentValue\">Değer</label><textarea id=\"contentValue\" rows=\"3\" maxlength=\"2000\"></textarea><button id=\"contentSave\" type=\"button\">Ayarı kaydet</button><p id=\"contentStatus\" role=\"status\"></p></div><div id=\"mediaPanel\" hidden><h2>Fotoğraf galerisi</h2><p>JPEG, PNG veya WebP, en fazla 5 MB. Depolama bağlı değilse yükleme yapamazsın.</p><input id=\"galleryFile\" type=\"file\" accept=\"image/jpeg,image/png,image/webp\"><button type=\"button\" id=\"galleryUpload\">Fotoğraf yükle</button><p id=\"galleryStatus\" role=\"status\"></p><div id=\"galleryList\"></div></div><div id=\"leadsPanel\" hidden><h2>Teklif talepleri</h2><button type=\"button\" id=\"refreshLeads\">Talepleri yenile</button><p id=\"leadStatus\" role=\"status\"></p><div id=\"leadList\"></div></div><div id=\"auditPanel\" hidden><h2>Yönetim kayıtları</h2><button type=\"button\" id=\"refreshAudit\">Kayıtları yenile</button><div id=\"auditList\"></div></div><p id=\"status\" role=\"status\"></p></section></main><script>const galleryList=document.querySelector(\"#galleryList\"),galleryStatus=document.querySelector(\"#galleryStatus\"),leadList=document.querySelector(\"#leadList\");\nasync function getJSON(url,opts){const r=await fetch(url,opts);let data;try{data=await r.json()}catch{throw Error(\"Sunucu yanıtı okunamadı\")};if(!r.ok)throw Error(data.error||\"İstek başarısız\");return data}\nfunction line(tag,label){const el=document.createElement(tag);el.textContent=label;return el}\nasync function reloadGallery(){try{const data=await getJSON(\"/api/admin/gallery\");document.querySelector(\"#mediaPanel\").hidden=false;galleryList.replaceChildren();for(const item of data){const wrap=document.createElement(\"div\"),img=document.createElement(\"img\");img.src=item.url;img.alt=item.title||\"Galeri fotoğrafı\";img.loading=\"lazy\";img.style.cssText=\"max-width:100%;max-height:180px;display:block;margin:12px 0\";const button=document.createElement(\"button\");button.textContent=\"Fotoğrafı sil\";button.type=\"button\";button.addEventListener(\"click\",async()=>{if(!confirm(\"Bu fotoğraf kalıcı silinsin mi?\"))return;try{await getJSON(\"/api/admin/gallery\",{method:\"DELETE\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({id:item.id})});await reloadGallery()}catch(e){galleryStatus.textContent=e.message}});wrap.append(img,button);galleryList.append(wrap)}}catch(e){galleryStatus.textContent=e.message}}\ndocument.querySelector(\"#galleryUpload\").addEventListener(\"click\",async()=>{const file=document.querySelector(\"#galleryFile\").files[0];if(!file)return galleryStatus.textContent=\"Fotoğraf seç.\";galleryStatus.textContent=\"Yükleniyor...\";try{await getJSON(\"/api/admin/gallery\",{method:\"POST\",headers:{\"content-type\":file.type},body:file});galleryStatus.textContent=\"Fotoğraf yüklendi\";await reloadGallery()}catch(e){galleryStatus.textContent=e.message}});\nasync function reloadLeads(){const status=document.querySelector(\"#leadStatus\");try{const data=await getJSON(\"/api/admin/quotes\");document.querySelector(\"#leadsPanel\").hidden=false;leadList.replaceChildren();for(const q of data){const wrap=document.createElement(\"div\");wrap.style.cssText=\"border-top:1px solid #ddd;margin-top:12px;padding-top:12px\";wrap.append(line(\"strong\",q.loading_address+\" → \"+q.unloading_address),line(\"p\",\"Tarih: \"+q.moving_date));const select=document.createElement(\"select\");for(const [code,title] of [[\"new\",\"Yeni\"],[\"contacted\",\"Görüşüldü\"],[\"completed\",\"Tamamlandı\"],[\"cancelled\",\"İptal\"]]){const opt=document.createElement(\"option\");opt.value=code;opt.textContent=title;select.append(opt)}select.value=q.status;select.addEventListener(\"change\",async()=>{try{await getJSON(\"/api/admin/quotes\",{method:\"PUT\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({id:q.id,status:select.value})});status.textContent=\"Talep güncellendi\"}catch(e){status.textContent=e.message}});wrap.append(select);leadList.append(wrap)}status.textContent=data.length+\" talep bulundu\"}catch(e){status.textContent=e.message}}\ndocument.querySelector(\"#refreshLeads\").onclick=reloadLeads;\nasync function reloadAudit(){const div=document.querySelector(\"#auditList\");try{const rows=await getJSON(\"/api/admin/audit\");document.querySelector(\"#auditPanel\").hidden=false;div.replaceChildren();rows.forEach(r=>div.append(line(\"p\",new Date(r.created_at).toLocaleString(\"tr-TR\")+\" — \"+r.action+\" (\"+r.target+\")\")))}catch(e){div.replaceChildren(line(\"p\",e.message))}}\ndocument.querySelector(\"#refreshAudit\").onclick=reloadAudit;\nconst contentDefs={\"businessName\":\"Firma adı\",\"phone\":\"Telefon\",\"whatsapp\":\"WhatsApp numarası\",\"email\":\"E-posta\",\"address\":\"Adres / bölge\",\"hours\":\"Çalışma saatleri\",\"seoTitle\":\"SEO sayfa başlığı\",\"seoDescription\":\"SEO açıklaması\",\"primaryColor\":\"Ana renk (#10213c)\",\"accentColor\":\"Vurgu rengi (#16a34a)\",\"logoUrl\":\"Logo URL (aynı site, https)\",\"bannerUrl\":\"Kapak görseli URL (aynı site, https)\",\"reviewUrl\":\"Yorum bırakma URL (aynı site)\",\"googlePlaceId\":\"Google Place ID (hazırlık)\",\"footerText\":\"Alt bilgi yazısı\",\"hideReviews\":\"Yorumları gizle (true/false)\",\"hideGallery\":\"Galeriyi gizle (true/false)\",\"showOfferForm\":\"Teklif formunu göster (true/false)\"};\nconst contentSelect=document.querySelector(\"#contentKey\"),contentValue=document.querySelector(\"#contentValue\"),contentStatus=document.querySelector(\"#contentStatus\");let contentData={};\nfor(const [id,title] of Object.entries(contentDefs)){const opt=document.createElement(\"option\");opt.value=id;opt.textContent=title;contentSelect.append(opt)}\nfunction updateContent(){contentValue.value=contentData[contentSelect.value]||\"\"}\ncontentSelect.addEventListener(\"change\",updateContent);\nasync function loadContent(){try{const r=await fetch(\"/api/admin/content\");if(!r.ok)throw Error(\"Ayarlar okunamadı\");contentData=await r.json();document.querySelector(\"#contentPanel\").hidden=false;updateContent()}catch(e){contentStatus.textContent=e.message}}\ndocument.querySelector(\"#contentSave\").addEventListener(\"click\",async()=>{contentStatus.textContent=\"Kaydediliyor...\";try{const body={key:contentSelect.value,value:contentValue.value};const r=await fetch(\"/api/admin/content\",{method:\"PUT\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||\"Kaydedilemedi\");contentData[body.key]=body.value;contentStatus.textContent=\"Kaydedildi\"}catch(e){contentStatus.textContent=e.message}});\nconst secNames={\"anasayfa\":\"Ana sayfa\",\"hizmetler\":\"Hizmetler\",\"aracimiz\":\"Aracımız\",\"bolgeler\":\"Hizmet bölgeleri\",\"nedenbiz\":\"Neden biz\",\"guzergahlar\":\"Güzergâhlar\",\"tasima-ornekleri\":\"Taşıma örnekleri\",\"turkiye-haritasi\":\"Türkiye haritası\",\"yorumlar\":\"Müşteri yorumları\",\"sss\":\"Sıkça sorulan sorular\",\"hakkimizda\":\"Hakkımızda\",\"iletisim\":\"İletişim\"};\nconst secSelect=document.querySelector(\"#sectionSelect\"),secField=document.querySelector(\"#sectionField\"),secValue=document.querySelector(\"#sectionValue\"),secStatus=document.querySelector(\"#sectionStatus\");\nfor(const [id,name] of Object.entries(secNames)){const option=document.createElement(\"option\");option.value=id;option.textContent=name;secSelect.append(option)}\nlet secData={};\nasync function loadSections(){try{const r=await fetch(\"/api/admin/sections\");if(!r.ok)throw Error(\"Bölümler okunamadı\");secData=await r.json();document.querySelector(\"#sectionPanel\").hidden=false;updateSecValue()}catch(e){secStatus.textContent=e.message}}\nfunction updateSecValue(){secValue.value=secData[secSelect.value+\":\"+secField.value]||\"\"}\nsecSelect.addEventListener(\"change\",updateSecValue);secField.addEventListener(\"change\",updateSecValue);\ndocument.querySelector(\"#saveSection\").addEventListener(\"click\",async()=>{secStatus.textContent=\"Kaydediliyor...\";try{const body={section:secSelect.value,field:secField.value,value:secValue.value};const r=await fetch(\"/api/admin/sections\",{method:\"PUT\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||\"Kaydedilemedi\");secData[body.section+\":\"+body.field]=body.value;secStatus.textContent=\"Kaydedildi\"}catch(e){secStatus.textContent=e.message}});\nconst key=document.querySelector(\"#key\"),value=document.querySelector(\"#value\"),status=document.querySelector(\"#status\");let settings={};async function load(){try{const r=await fetch(\"/api/admin/settings\",{credentials:\"same-origin\"});if(!r.ok)throw Error((await r.json()).error||\"Erişim hatası\");settings=await r.json();document.querySelector(\"#form\").hidden=false;document.querySelector(\"#loginForm\").hidden=true;document.querySelector(\"#logout\").hidden=false;status.textContent=\"\";show();loadSections();loadContent();reloadGallery();reloadLeads();reloadAudit()}catch(e){status.textContent=e.message}}function show(){value.value=settings[key.value]||\"\"}key.addEventListener(\"change\",show);document.querySelector(\"#form\").addEventListener(\"submit\",async e=>{e.preventDefault();status.textContent=\"Kaydediliyor...\";try{const r=await fetch(\"/api/admin/settings\",{method:\"PUT\",credentials:\"same-origin\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({[key.value]:value.value})});const data=await r.json();if(!r.ok)throw Error(data.error||\"Hata\");settings[key.value]=value.value;status.textContent=\"Kaydedildi\"}catch(e){status.textContent=e.message}});document.querySelector(\"#loginForm\").addEventListener(\"submit\",async e=>{e.preventDefault();try{const r=await fetch(\"/api/admin/login\",{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({password:document.querySelector(\"#password\").value})});if(!r.ok)throw Error(\"Giriş başarısız\");document.querySelector(\"#password\").value=\"\";await load()}catch(e){status.textContent=e.message}});document.querySelector(\"#logout\").addEventListener(\"click\",async()=>{await fetch(\"/api/admin/logout\",{method:\"POST\"});location.reload()});load();</script></body></html>";
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

async function syncGoogleReviews(env){
 const {GOOGLE_CLIENT_ID:id,GOOGLE_CLIENT_SECRET:secret,GOOGLE_REFRESH_TOKEN:refresh,GOOGLE_BUSINESS_LOCATION:location}=env;
 if(!id||!secret||!refresh||!/^accounts\/[A-Za-z0-9_-]+\/locations\/[A-Za-z0-9_-]+$/.test(location||"")||!env.SITE_DB)throw Error("Google Business Profile OAuth yapılandırılmadı");
 const form=new URLSearchParams({client_id:id,client_secret:secret,refresh_token:refresh,grant_type:"refresh_token"});
 const tokenRes=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:form});
 if(!tokenRes.ok)throw Error("Google OAuth token alınamadı");
 const token=(await tokenRes.json()).access_token;if(!token)throw Error("Google token eksik");
 const response=await fetch("https://mybusiness.googleapis.com/v4/"+location+"/reviews?pageSize=50&orderBy=updateTime%20desc",{headers:{"authorization":"Bearer "+token}});
 if(!response.ok)throw Error("Google yorum API hatası HTTP "+response.status);
 const result=await response.json();const scores={ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5};
 const items=(result.reviews||[]).slice(0,50).map(r=>({id:String(r.reviewId||"").slice(0,100),author:String(r.reviewer?.displayName||"Google kullanıcısı").slice(0,120),rating:scores[r.starRating]||0,comment:String(r.comment||"").slice(0,1200),updated:String(r.updateTime||"")})).filter(r=>r.rating>=1);
 const saved={source:"google",items,averageRating:Number(result.averageRating||0),totalReviewCount:Number(result.totalReviewCount||0),syncedAt:Date.now()};
 await env.SITE_DB.prepare("INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind("google:cachedReviews",JSON.stringify(saved)).run();
 await audit(env,"google.reviews.sync",String(items.length));return saved;
}
const uuid=()=>crypto.randomUUID();
const audit=async(env,action,target="")=>{try{await env.SITE_DB.prepare("INSERT INTO admin_audit(id,action,target,created_at) VALUES(?,?,?,?)").bind(uuid(),action,target,Date.now()).run()}catch(_){}};
const validOrigin=(request,url)=>request.headers.get("origin")===url.origin;
const allowedImageType={"image/jpeg":".jpg","image/png":".png","image/webp":".webp"};
async function galleryList(env){const rows=await env.SITE_DB.prepare("SELECT id,title,sort_order,created_at FROM gallery_items ORDER BY sort_order ASC,created_at DESC LIMIT 150").all();return rows.results.map(r=>({...r,url:"/api/site/image/"+encodeURIComponent(r.id)}))}
export default {async scheduled(event,env,ctx){ctx.waitUntil(syncGoogleReviews(env).catch(e=>console.error("Google review sync:",e.message)))},async fetch(request,env){
 const url=new URL(request.url);
 if (/^\/(?:src|migrations)(?:\/|$)/i.test(url.pathname) || /^\/(?:wrangler\.jsonc|ADMIN_SETUP\.md|\.git(?:\/|$))/i.test(url.pathname)) return json({error:"Not found"},404);
 if(request.method!=="GET"&&request.method!=="HEAD"&&!url.pathname.startsWith("/api/admin/")&&url.pathname!=="/api/site/quote") return json({error:"Method not allowed"},405);
 if(url.pathname==="/admin"||url.pathname==="/admin/"||url.pathname==="/admin/index.html"){
  // Serve HTML as an in-memory response to avoid the static-assets canonical redirect loop.
  return new Response(ADMIN_HTML,{status:200,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","x-frame-options":"DENY"}});
 }

 if(url.pathname==="/api/admin/logs"){
  if(!(await authorized(request,env)))return json({error:"Yönetici girişi gerekli"},403);
  if(request.method!=="GET")return json({error:"Method not allowed"},405);
  return json({message:"İşlem kayıtları henüz etkin değil. Bu sürümde yalnızca oturum denetimi vardır."});
 }
 if(url.pathname==="/api/admin/status"){
  if(request.method!=="GET")return json({error:"Method not allowed"},405);
  return json({authenticated:await authorized(request,env)});
 }
 if(url.pathname==="/api/admin/login"){if(request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);return login(request,env)}
 if(url.pathname==="/api/admin/logout"){if(request.headers.get("origin")!==url.origin)return json({error:"Origin rejected"},403);if(request.method!=="POST")return json({error:"Method not allowed"},405);const token=cookie(request);if(token&&env.SITE_DB){const digest=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token))));await env.SITE_DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(digest).run()}return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":"dn_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"}})}
 if(url.pathname.startsWith("/api/admin/")||url.pathname==="/admin"||url.pathname.startsWith("/admin/")){
  if(!(await authorized(request,env)))return json({error:"Yönetici girişi gerekli."},403);

  if(url.pathname==="/api/admin/google-reviews/sync"){
   if(request.method!=="POST")return json({error:"Yöntem desteklenmiyor"},405);
   if(!validOrigin(request,url))return json({error:"Origin rejected"},403);
   try{const saved=await syncGoogleReviews(env);return json(saved)}catch(e){return json({error:String(e.message||"Senkronizasyon başarısız").slice(0,200)},503)}
  }

  if(url.pathname==="/api/admin/blocks"){
   if(!env.SITE_DB)return json({error:"Veritabanı bağlantısı yok"},503);
   const allowed=["services","reasons","faq","routes"];
   if(request.method==="GET"){const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'blocks:%'").all();return json(Object.fromEntries(rows.results.map(r=>[r.key.slice(7),JSON.parse(r.value)])))}
   if(request.method!=="PUT"||!validOrigin(request,url))return json({error:"İstek reddedildi"},403);
   if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return json({error:"JSON gerekli"},415);
   if(Number(request.headers.get("content-length")||0)>20000)return json({error:"İstek çok büyük"},413);
   let b;try{b=await request.json()}catch{return json({error:"Geçersiz JSON"},400)}
   if(!b||!allowed.includes(b.key)||!Array.isArray(b.items)||b.items.length>24)return json({error:"Geçersiz liste"},400);
   const clean=[];for(const x of b.items){
    if(!x||typeof x.title!=="string"||typeof x.description!=="string"||typeof x.icon!=="string"||x.title.length>160||x.description.length>1000||x.icon.length>12)return json({error:"Geçersiz kart bilgisi"},400);
    clean.push({title:x.title.trim(),description:x.description.trim(),icon:x.icon.trim()});
   }
   await env.SITE_DB.prepare("INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind("blocks:"+b.key,JSON.stringify(clean)).run();
   await audit(env,"blocks.update",b.key);return json({ok:true});
  }
  if(url.pathname==="/api/admin/gallery"){
   if(!env.SITE_DB)return json({error:"Veritabanı bağlantısı yok"},503);
   if(request.method==="GET")return json(await galleryList(env));
   if(!validOrigin(request,url))return json({error:"Origin rejected"},403);
   if(request.method==="POST"){
    if(!env.MEDIA_BUCKET)return json({error:"MEDIA_BUCKET R2 bağlanmalı"},503);
    const type=request.headers.get("content-type")||"";
    if(!Object.hasOwn(allowedImageType,type))return json({error:"JPEG, PNG veya WebP gerekli"},415);
    if(Number(request.headers.get("content-length")||0)>5000000)return json({error:"Dosya en fazla 5 MB olabilir"},413);
    const bytes=await request.arrayBuffer();if(bytes.byteLength===0||bytes.byteLength>5000000)return json({error:"Dosya boyutu geçersiz"},413);
    const view=new Uint8Array(bytes);
    const jpeg=view[0]===255&&view[1]===216&&view[2]===255;
    const png=view.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]);
    const webp=String.fromCharCode(...view.slice(0,4))==="RIFF"&&String.fromCharCode(...view.slice(8,12))==="WEBP";
    if(!((type==="image/jpeg"&&jpeg)||(type==="image/png"&&png)||(type==="image/webp"&&webp)))return json({error:"Görsel içerik biçimi hatalı"},415);
    const id=uuid(),key="gallery/"+id+allowedImageType[type];
    await env.MEDIA_BUCKET.put(key,bytes,{httpMetadata:{contentType:type}});
    try{await env.SITE_DB.prepare("INSERT INTO gallery_items(id,title,image_key,sort_order,created_at) VALUES(?,?,?,?,?)").bind(id,"",key,Date.now(),Date.now()).run()}catch(e){await env.MEDIA_BUCKET.delete(key);throw e}
    await audit(env,"gallery.upload",id);return json({ok:true,id},201);
   }
   if(request.method==="DELETE"){
    let b;try{b=await request.json()}catch{return json({error:"Geçersiz JSON"},400)}
    if(typeof b?.id!=="string")return json({error:"Kimlik gerekli"},400);
    const row=await env.SITE_DB.prepare("SELECT image_key FROM gallery_items WHERE id=?").bind(b.id).first();if(!row)return json({error:"Bulunamadı"},404);
    await env.SITE_DB.prepare("DELETE FROM gallery_items WHERE id=?").bind(b.id).run();
    if(env.MEDIA_BUCKET)await env.MEDIA_BUCKET.delete(row.image_key);
    await audit(env,"gallery.delete",b.id);return json({ok:true});
   }
   return json({error:"Yöntem desteklenmiyor"},405);
  }
  if(url.pathname==="/api/admin/quotes"){
   if(!env.SITE_DB)return json({error:"Veritabanı bağlantısı yok"},503);
   if(request.method==="GET"){const rows=await env.SITE_DB.prepare("SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 200").all();return json(rows.results)}
   if(request.method!=="PUT"||!validOrigin(request,url))return json({error:"İstek reddedildi"},403);
   let b;try{b=await request.json()}catch{return json({error:"Geçersiz JSON"},400)}
   if(typeof b?.id!=="string"||!["new","contacted","completed","cancelled"].includes(b.status))return json({error:"Geçersiz durum"},400);
   await env.SITE_DB.prepare("UPDATE quote_requests SET status=? WHERE id=?").bind(b.status,b.id).run();
   await audit(env,"quote.status",b.id+":"+b.status);return json({ok:true});
  }
  if(url.pathname==="/api/admin/audit"){
   if(!env.SITE_DB)return json({error:"Veritabanı bağlantısı yok"},503);
   if(request.method!=="GET")return json({error:"Yöntem desteklenmiyor"},405);
   const rows=await env.SITE_DB.prepare("SELECT action,target,created_at FROM admin_audit ORDER BY created_at DESC LIMIT 100").all();return json(rows.results);
  }
  if(url.pathname==="/api/admin/content"){
   if(!env.SITE_DB)return json({error:"Veritabanı bağlantısı yok"},503);
   const keys=["businessName","phone","whatsapp","email","address","hours","seoTitle","seoDescription","primaryColor","accentColor","logoUrl","bannerUrl","reviewUrl","googlePlaceId","footerText","hideReviews","hideGallery","showOfferForm"];
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
    if(["logoUrl","bannerUrl"].includes(body.key)&&value){try{const u=new URL(value,url.origin);if(u.protocol!=="https:"||u.username||u.password||u.origin!==url.origin)return json({error:"Görsel/bağlantı aynı site altında HTTPS olmalı"},400)}catch{return json({error:"Geçersiz URL"},400)}}
    if(body.key==="reviewUrl"&&value){try{const u=new URL(value);if(u.protocol!=="https:"||u.username||u.password)return json({error:"HTTPS bağlantısı gerekli"},400)}catch{return json({error:"Geçersiz URL"},400)}}
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


 if(url.pathname==="/api/site/blocks"){
  if(!env.SITE_DB)return json({});
  const rows=await env.SITE_DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'blocks:%'").all();
  return json(Object.fromEntries(rows.results.map(r=>[r.key.slice(7),JSON.parse(r.value)])));
 }
 if(url.pathname==="/api/site/gallery"){
  if(!env.SITE_DB)return json([]);
  return json(await galleryList(env));
 }
 if(url.pathname.startsWith("/api/site/image/")){
  if(!env.SITE_DB||!env.MEDIA_BUCKET)return json({error:"Görsel depolama yapılandırılmadı"},503);
  const id=url.pathname.split("/").pop();
  if(!/^[0-9a-f-]{36}$/.test(id))return json({error:"Bulunamadı"},404);
  const item=await env.SITE_DB.prepare("SELECT image_key FROM gallery_items WHERE id=?").bind(id).first();
  if(!item)return json({error:"Bulunamadı"},404);
  const obj=await env.MEDIA_BUCKET.get(item.image_key);
  if(!obj)return json({error:"Bulunamadı"},404);
  return new Response(request.method==="HEAD"?null:obj.body,{headers:{"content-type":obj.httpMetadata?.contentType||"image/webp","cache-control":"public,max-age=3600","x-content-type-options":"nosniff"}});
 }
 if(url.pathname==="/api/site/quote"){
  if(request.method!=="POST")return json({error:"Yöntem desteklenmiyor"},405);
  if(!validOrigin(request,url))return json({error:"Origin rejected"},403);
  if(!env.SITE_DB)return json({error:"Veritabanı bağlantısı yok"},503);
  if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return json({error:"JSON gerekli"},415);
  if(Number(request.headers.get("content-length")||0)>4096)return json({error:"İstek çok büyük"},413);
  let b;try{b=await request.json()}catch{return json({error:"Geçersiz istek"},400)}
  for(const k of ["loading","unloading","date"])if(typeof b?.[k]!=="string"||!b[k].trim()||b[k].length>300)return json({error:"Geçersiz alan"},400);
  if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(b.date)||Number.isNaN(Date.parse(b.date)))return json({error:"Geçersiz tarih"},400);
  const name=String(b.name||"").trim(),contact=String(b.contact||"").trim();
  if(!name||name.length>100||!contact||contact.length>30||!/^[+0-9 ()-]{7,30}$/.test(contact))return json({error:"Ad ve geçerli iletişim numarası gerekli"},400);
  const ip=request.headers.get("cf-connecting-ip")||"unknown";
  const key=hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip))));
  const now=Date.now();
  const limit=await env.SITE_DB.prepare("INSERT INTO quote_rate_limits(client_key,attempts,window_expires) VALUES(?,1,?) ON CONFLICT(client_key) DO UPDATE SET attempts=CASE WHEN window_expires<? THEN 1 ELSE attempts+1 END,window_expires=CASE WHEN window_expires<? THEN excluded.window_expires ELSE window_expires END RETURNING attempts").bind(key,now+3600000,now,now).first();
  if(limit.attempts>3)return json({error:"Saatlik teklif talebi sınırına ulaşıldı"},429);
  const created=Date.now(),id=uuid();
  await env.SITE_DB.prepare("INSERT INTO quote_requests(id,loading_address,unloading_address,moving_date,customer_name,customer_contact,status,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(id,b.loading.trim(),b.unloading.trim(),b.date,name,contact,"new",created).run();
  return json({ok:true,id});
 }
 if(url.pathname==="/api/site/reviews"){
  if(!env.SITE_DB)return json({items:[],source:"none"});
  const row=await env.SITE_DB.prepare("SELECT value FROM site_settings WHERE key='google:cachedReviews'").bind().first();
  if(!row)return json({items:[],source:"none"});
  try{return json(JSON.parse(row.value))}catch{return json({items:[],source:"none"})}
 }
 if(url.pathname==="/api/site/health")return json({ok:true});
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
