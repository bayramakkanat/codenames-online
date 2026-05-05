# 🎮 Codenames Türkçe — Lokal WiFi Versiyonu

## Kurulum (Tek Seferlik)

1. **Node.js** yüklü olmalı: https://nodejs.org (LTS sürümü)
2. Bu klasörü bir yere kopyalayın
3. Terminal / Komut İstemi açın, klasöre gelin:
   ```
   cd codenames
   node server.js
   ```

## Oyun Başlatma

1. `node server.js` çalıştırın
2. Terminalde şunu göreceksiniz:
   ```
   📱 Tablet için açın: http://192.168.x.x:3456/
   🕵️  Spymaster için: http://192.168.x.x:3456/spymaster.html
   ```
3. **Tablet** büyük ekranı açsın (ilk link)
4. Tablet'te **"📱 QR Kod"** butonuna basın
5. **Spymaster** telefonuyla QR kodu tarasın

## Oyun Kuralları

- 5x5 ızgara, 25 kelime
- 🔴 Kırmızı: 9 kelime, 🔵 Mavi: 8 kelime, 💀 Suikastçı: 1, Masum: 7
- Kırmızı takım başlar
- Spymaster tek kelime + sayı ipucu verir (telefondan)
- Takım arkadaşları tabletten kartlara basar
- İlk tüm kelimelerini bulan takım kazanır!
- Suikastçıya basılırsa o takım anında kaybeder

## Gereksinimler

- Herkes aynı WiFi ağında olmalı
- Node.js yüklü bir bilgisayar (sunucu görevi görür)
- 1 tablet (büyük ekran, herkes görür)
- Spymaster'ların telefonu (QR ile bağlanır)
