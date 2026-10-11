# Güvenli yönetim paneli — kurulum bekliyor

Bu geliştirme **henüz canlıya alınmamalıdır**. Önce Cloudflare Zero Trust > Access > Applications üzerinden `/admin/*` ve `/api/admin/*` yollarını koruyan Access uygulaması oluşturun. Yalnızca yönetici e-posta adreslerini allowlist'e ekleyin; herkes için izin kuralı kullanmayın.

Worker ortam değişkenleri: `CF_ACCESS_TEAM_DOMAIN` (ör. example.cloudflareaccess.com), `CF_ACCESS_AUD` (Access uygulamasının AUD etiketi). Bunlar gerçek değerlerle ayarlanmadan panel **403** döndürür (fail-closed).

D1 veritabanı oluşturun, `migrations/0001_settings.sql` dosyasını uygulayın ve Worker'a `SITE_DB` binding'i bağlayın. Bağlanmadığında API **503** döndürür.

Bu temel sürüm yalnızca beş metin alanını saklar. Sitenin bu değerleri okuyup göstermesi, 81 il haritası ve Google yorumları ayrı entegrasyon aşamalarıdır. API sır saklamaz; istemciye hassas anahtar koymayın. Worker'ı ve statik varlıkları aynı Cloudflare dağıtımında yayınlayın.

Canlıya geçmeden önce Access politikalarını, token doğrulamasını, D1 migration'ı ve yetkisiz isteklerin reddedildiğini test edin.
