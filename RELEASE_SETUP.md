# Doğan Nakliyat — Kapsamlı Panel Sürümü: Yayın Öncesi Kurulum

Bu dal, canlı üretim dalı `main` üzerine otomatik birleştirilmemelidir. **Önce Cloudflare R2 ve D1 hazırlığını tamamlayın**, sonra test edip birleştirin.

## 1. Cloudflare R2 fotoğraf depolama

Cloudflare dashboard → R2 Object Storage → Create bucket:

- Bucket adı: **`dogan-nakliyat-media`**
- Public access: **gerekli değil / kapalı bırakın**
- Worker binding adı: **`MEDIA_BUCKET`** (`wrangler.jsonc` içinde tanımlıdır)
- Fotoğraflar yönetim oturumu ile yüklenir. En fazla 5 MB JPEG, PNG veya WebP; halka açık görüntülemeler Worker üzerinden yapılır.

Cloudflare hesabınız R2 özelliğini henüz açmadıysa, panelde etkinleştirmeniz gerekebilir; Cloudflare bunu faturalandırma kurallarına tabi tutabilir.

## 2. D1 veritabanı yeni tabloları

Cloudflare → D1 → **`dogan-nakliyat-db`** → Console bölümünü açın. Bu depodaki **`migrations/0002_content_management.sql`** dosyasının tamamını çalıştırın. SQL `IF NOT EXISTS` kullandığından mevcut `site_settings`, `admin_sessions`, `admin_login_attempts` tablolarını silmez.

Yeni tablolar: `gallery_items`, `quote_requests`, `admin_audit`, `quote_rate_limits`.

SQL başarıyla çalışmadan yeni teklif kaydı/galeri işlemlerini canlıya almayın.

## 3. Google İşletme Profili yorumları

Yorumları gerçek Google profilinden otomatik çekmek için Google Business Profile API erişimi, doğrulanmış işletme ve yetkili OAuth 2.0 bağlantısı gereklidir. Google Cloud projesinden API erişimi ve aşağıdaki değerleri sağlayın:

- `GOOGLE_CLIENT_ID` — OAuth istemci kimliği (Cloudflare Secret)
- `GOOGLE_CLIENT_SECRET` — OAuth istemci sırrı (Cloudflare Secret)
- `GOOGLE_REFRESH_TOKEN` — `https://www.googleapis.com/auth/business.manage` yetkisiyle alınmış yenileme tokeni (Cloudflare Secret)
- `GOOGLE_BUSINESS_LOCATION` — `accounts/ACCOUNT_ID/locations/LOCATION_ID` biçimindeki Google işletme konumu kaynağı (Worker Variable/Secret)

Bunları **Cloudflare Worker → Settings → Variables and Secrets** altında tanımlayın. Sırları **GitHub'a, sohbete veya ekran görüntüsüne yazmayın**.

Google API kurulumu tamamlanınca panelden **Google yorumlarını şimdi güncelle** butonuna basın. Sonraki senkronizasyonlar altı saatte bir `wrangler.jsonc` cron ile planlanır. Google bağlantısı kurulmadıysa mevcut statik yorumlar gösterilir ve otomatik güncelleme iddia edilmez.

Resmî referans: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list

## 4. Sürümü yayınlama

Hazırlıklardan sonra bu dal için açılmış GitHub Pull Request'i test edin, ardından `main` dalına birleştirin. Cloudflare → Workers & Pages → `dogan-nakliyat-web` → Deployments'da yeni dağıtım **Ready** olduktan sonra şu kontrolleri yapın:

1. `/api/site/health` 200 ve `{"ok":true}` dönmeli.
2. `/admin/` açılmalı, mevcut yönetici şifresiyle giriş yapılabilmeli.
3. `/api/admin/gallery`, `/api/admin/quotes`, `/api/admin/blocks` anonim erişimde 403 vermeli.
4. Türkiye haritasında 81 il seçilebilmeli.
5. Fotoğraf yükle/sırala/sil, teklif formundan bir deneme talebi gönder, yönetim panelinde gör ve sil.
6. Google OAuth bağlantısı varsa senkronizasyonu doğrula.
7. Mobil görünüm ve WhatsApp bağlantısını kontrol et.

`ADMIN_PASSWORD_HASH` ve `ADMIN_PASSWORD_SALT` değerleri bu sürüm tarafından değiştirilmez. Eski oturum güvenliği korunur.

## Veri gizliliği

Formdaki ad/telefon/rota/tarih D1'de saklanır; gelen talepler yönetici oturumuyla görüntülenebilir. Kullanıcıya `/gizlilik.html` teknik bilgilendirme sayfası eklenmiştir. İşletmeye özgü KVKK yükümlülükleri için nihai aydınlatma metnini ayrıca değerlendirin.

## Harita verisi lisansı

`data/ODBL-ATTRIBUTION.md` dosyasında Türkiye il sınırlarının OpenStreetMap/ODbL atıf ve kaynak bilgisi bulunmaktadır.
