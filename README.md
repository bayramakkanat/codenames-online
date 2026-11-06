# 🎮 Codenames Türkçe

Tablet (büyük ekran) + spymaster telefonları ile oynanan Türkçe Codenames.
Render üzerinde çalışır; her push'ta otomatik yayınlanır.

## Nasıl oynanır

1. Tablette ya da bilgisayarda oyunun Render adresini aç (`/` sayfası = büyük ekran).
2. **📱 Spymaster QR** düğmesine bas, spymaster'lar telefonlarıyla QR kodu tarasın.
3. Spymaster'lar kart renklerini telefondan görür, tek kelime + sayı ipucu verir.
4. Takım arkadaşları büyük ekrandan kartlara basar.

## Kurallar

- 5x5 ızgara, 25 kelime: 🔴 9, 🔵 8, 💀 1 suikastçı, 7 masum
- Kırmızı takım başlar
- Tüm kelimelerini ilk bulan takım kazanır
- Suikastçıya basan takım anında kaybeder

## Teknik notlar

- `server.js`: Node.js sunucusu, oyun durumu bellekte tutulur (servis yeniden başlarsa oyun sıfırlanır)
- `tablet.html`: büyük ekran, `spymaster.html`: telefon ekranı
- Render'da Start Command: `npm start` (`node server.js`), port `PORT` ortam değişkeninden gelir
