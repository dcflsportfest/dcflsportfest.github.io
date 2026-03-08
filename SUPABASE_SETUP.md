# Supabase Setup

Bu proje statik GitHub Pages uzerinde calisiyor. Gercek online admin icin tarayicidan erisilebilen bir backend gerekiyor. Bu surum Supabase ile buna hazirlandi.

## 1. Proje olustur

1. Supabase'te yeni bir proje olustur.
2. `Authentication > Users` altindan admin kullanicisi ekle.
3. `SQL Editor` icinde [supabase-setup.sql](./supabase-setup.sql) dosyasini calistir.

## 2. Config dosyasini doldur

1. [supabase-config.js](./supabase-config.js) dosyasini ac.
2. `url` alanina proje URL'ini gir.
3. `publishableKey` alanina public publishable key'i gir.

Not:
- `publishableKey` tarayiciya gidebilir. Bu normaldir.
- `service_role` anahtarini kesinlikle bu siteye koyma.

## 3. Admin girisi

1. `admin.html` sayfasini ac.
2. Admin e-posta ve sifre ile giris yap.
3. Veriyi duzenle ve `Kaydet` butonuna bas.

Kayit sonrasi:
- Ana sayfa public olarak Supabase'ten veriyi ceker.
- Tum ziyaretciler ayni skoru ve sonuclari gorur.

## 4. Ilk kayit

Tabloda ilk satir yoksa problem degil.
Ilk `Kaydet` islemi `key = main` satirini olusturur ve `owner_id` alanina giris yapan kullaniciyi yazar.

## 5. Sorun cikarsa

- `Baglanti Durumu` hala `Yerel Mod` ise:
  - `supabase-config.js` bos olabilir
  - `url` veya `publishableKey` yanlis olabilir
- `Kaydet` calisiyor ama online veriye yazmiyorsa:
  - admin oturumu acik olmayabilir
  - SQL policy uygulanmamis olabilir
  - tablo adi degismis olabilir
