# Supabase Setup

Bu proje statik GitHub Pages üzerinde çalışıyor. Gerçek online admin için tarayıcıdan erişilebilen bir backend gerekiyor. Bu sürüm Supabase ile buna hazırlandı.

## 1. Proje oluştur

1. Supabase'te yeni bir proje oluştur.
2. `Authentication > Users` altından giriş yapacak kullanıcıları ekle.
3. `SQL Editor` içinde [supabase-setup.sql](./supabase-setup.sql) dosyasını çalıştır.

## 2. Config dosyasını doldur

1. [supabase-config.js](./supabase-config.js) dosyasını aç.
2. `url` alanına proje URL'ini gir.
3. `publishableKey` alanına public publishable key'i gir.

Not:
- `publishableKey` tarayıcıya gidebilir. Bu normaldir.
- `service_role` anahtarını kesinlikle bu siteye koyma.

## 3. Admin yetkisini nasıl verirsin?

Bu sürümde admin yetkisi panelden verilmez.

Admin yapmak istediğin e-postayı Supabase içinde `admin_users` tablosuna eklersin.

Örnek SQL:

```sql
insert into public.admin_users (email)
values ('hazretitaylansahin@gmail.com')
on conflict (email) do nothing;
```

Giriş yapabilmesi için aynı e-postanın `Authentication > Users` altında da kullanıcı olarak bulunması gerekir.

## 4. Admin panel ne yapar?

- giriş yapan kullanıcının admin listesinde olup olmadığını kontrol eder
- admin ise skor ve sonuçları güncellemesine izin verir
- admin değilse paneli kilitler
- admin listesini sadece görüntüler

## 5. Veri akışı

- `Kaydet` online veriyi Supabase'e yazar
- Ana sayfa public olarak Supabase'ten veriyi çeker
- Tüm ziyaretçiler aynı skorları ve sonuçları görür
- Panel aynı zamanda tarayıcıda yerel bir kopya da tutmaz; girişsiz düzenleme kapalıdır

## 6. JSON Dışa Aktar ne yapar?

`JSON Dışa Aktar`, paneldeki mevcut veriyi `dcfl-admin-data.json` dosyası olarak indirir.

Bunu şunlar için kullanırsın:
- yedek almak
- başka cihaza aynı veriyi taşımak
- toplu değişiklikten önce güvenli kopya almak

## 7. Sorun çıkarsa

- `Bağlantı Durumu` hâlâ `Yerel Mod` ise:
  - `supabase-config.js` boş olabilir
  - `url` veya `publishableKey` yanlış olabilir
- Giriş yapıyor ama düzenleyemiyorsa:
  - e-posta `admin_users` tablosunda olmayabilir
  - SQL policy uygulanmamış olabilir
- Giriş yapamıyorsa:
  - kullanıcı `Authentication > Users` içinde olmayabilir
  - şifre yanlış olabilir
  - e-posta doğrulama ayarları sorunlu olabilir
