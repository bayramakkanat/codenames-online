// Codenames Türkçe - Kelime Listesi ve Oyun Mantığı
// Bu dosya hem tablet.html hem spymaster.html tarafından kullanılır

const KELIMELER= ["ELMA","ARMUT","MUZ","KİRAZ","ÇİLEK","KARPUZ","PORTAKAL","LİMON","ÜZÜM","ANANAS","MANGO","KAVUN","FINDIK","BAL","ŞEKER","TUZ","BİBER","SOĞAN","SARIMSAK","ZEYTİN","DOMATES","YUMURTA","ET","TAVUK","PEYNİR","YOĞURT","SÜT","EKMEK","ÇORBA","SALATA","PİLAV","MAKARNA","PİZZA","KEBAP","SUŞİ","HAMBURGER","PASTA","KEK","KURABİYE","ÇİKOLATA","DONDURMA","TATLI","ÇAY","KAHVE","SU","MASA","SANDALYE","KAPI","PENCERE","DUVAR","TAVAN","ZEMİN","LAMBA","SAAT","AYNA","YATAK","YASTIK","BATTANİYE","DOLAP","HALI","PERDE","KOLTUK","RAF","ÇEKMECE","ANAHTAR","BARDAK","TABAK","KAŞIK","ÇATAL","BIÇAK","TENCERE","TAVA","FIRIN","OCAK","KALEM","DEFTER","SİLGİ","KİTAP","DOSYA","BELGE","ZARF","PUL","MEKTUP","OKUL","SINIF","SINAV","DERS","TAHTA","TENEFFÜS","ADA","DAĞ","OVA","ORMAN","DENİZ","GÖL","NEHİR","ŞELALE","VADİ","UÇURUM","VOLKAN","BUZUL","SAVANA","BATAKLIK","OKYANUS","ÇÖL","KUM","TAŞ","TOPRAK","HAVA","ATEŞ","BUZ","MAGMA","KÖMÜR","GÜNEŞ","AY","YILDIZ","BULUT","YAĞMUR","KAR","RÜZGAR","FIRTINA","GÖKKUŞAĞI","GÖLGE","ŞİMŞEK","KASIRGA","UZAY","GEZEGEN","DÜNYA","EVREN","GALAKSİ","METEOR","IŞIN","KUZEY","GÜNEY","DOĞU","BATI","MERKEZ","SINIR","İSTANBUL","ANKARA","PARİS","LONDRA","TOKYO","ROMA","BERLİN","DUBAİ","SİNGAPUR","PİRAMİT","KULE","KALE","SARAY","CAMİ","KÖPRÜ","LİMAN","MEYDAN","TÜNEL","HAVAALANI","İSTASYON","DURAK","PARK","HASTANE","MÜZE","SİNEMA","TİYATRO","FABRİKA","HAPİSHANE","BANKA","MARKET","MAĞAZA","ARABA","OTOBÜS","TREN","UÇAK","GEMİ","TEKNE","BİSİKLET","MOTOSİKLET","TAKSİ","METRO","KAMYON","BALON","HELİKOPTER","ROKET","DENİZALTI","KEDİ","KÖPEK","AT","İNEK","KOYUN","KEÇİ","HOROZ","ÖRDEK","ASLAN","KAPLAN","FİL","ZÜRAFA","AYI","MAYMUN","TİLKİ","KURT","TAVŞAN","SİNCAP","KARTAL","BALIK","YUNUS","BALİNA","AHTAPOT","YILAN","KAPLUMBAĞA","PENGUEN","FLAMİNGO","BAYKUŞ","PAPAĞAN","ARI","KARINCA","ÖRÜMCEK","KELEBEK","JAGUAR","LEOPAR","PANTER","ZEBRA","KANGURU","KOALA","KUNDUZ","GERGEDAN","TİMSAH","ANNE","BABA","KARDEŞ","ÇOCUK","BEBEK","AİLE","ARKADAŞ","KOMŞU","MİSAFİR","DOKTOR","POLİS","ASKER","MÜHENDİS","AŞÇI","GARSON","TERZİ","BERBER","ÇİFTÇİ","SANATÇI","YAZAR","ŞAİR","OYUNCU","MÜZİSYEN","RESSAM","ÖĞRETMEN","ÖĞRENCİ","PİLOT","AVUKAT","HAKİM","KAPTAN","ŞEF","GAZETECİ","DEDEKTİF","AJAN","CASUS","FUTBOL","BASKETBOL","TENİS","VOLEYBOL","YÜZME","KOŞU","YÜRÜYÜŞ","KAYAK","SÖRF","MARATON","BOKS","GÜREŞ","DAĞCILIK","KAMP","PİKNİK","MÜZİK","ŞARKI","DANS","FİLM","SAHNE","ROL","KAMERA","FOTOĞRAF","ALBÜM","KONSER","SENARYO","DİZİ","SEZON","HEYKEL","TABLO","RESİM","SANAT","GALERİ","OPERA","BALE","FESTİVAL","SİRK","BİLGİSAYAR","TELEFON","ROBOT","DRONE","LAZER","UYDU","TELESKOP","PROGRAM","YAZILIM","VERİ","İNTERNET","UYGULAMA","FİZİK","KİMYA","BİYOLOJİ","MATEMATİK","FORMÜL","DENEY","LABORATUVAR","SEVGİ","NEFRET","MUTLULUK","ÜZÜNTÜ","KORKU","CESARET","UMUT","HAYAL","GERÇEK","YALAN","SIR","RÜYA","ŞANS","KADER","ZAMAN","HAFIZA","AKIL","ZEKA","BİLGİ","TECRÜBE","ÖĞRENME","BARIŞ","SAVAŞ","ADALET","ÖZGÜRLÜK","GÜVEN","KURAL","YASA","DÜZEN","TOPLUM","KÜLTÜR","GELENEK","BAYRAM","TATİL","EĞLENCE","PLAN","HEDEF","AMAÇ","BAŞARI","HATA","ÇÖZÜM","DEĞİŞİM","YENİLİK","AĞAÇ","ÇİÇEK","GÜL","LALE","PAPATYA","YAPRAK","DAL","KÖK","TOHUM","BAHÇE","TARLA","ALTIN","GÜMÜŞ","ELMAS","İNCİ","DEMİR","CAM","PARA","KART","HESAP","ŞİFRE","KİLİT","KASA","TORBA","KUTU","KARGO","BOMBA","HAZİNE","PUSULA","HARİTA","FENER","GÜÇ","ENERJİ","HIZ","IŞIK","SES","RENK","SAĞLIK","UYKU","DİNLENME","GECE","SABAH","AKŞAM","YOL","CADDE","SOKAK","PUZZLE","ZAR","OYUN","OYUNCAK","TOP","SATRANÇ","KORSAN"];

// Temizlenmiş ve benzersiz kelimeler
const TEMIZ_KELIMELER = [...new Set(KELIMELER.filter(k => k.length > 2 && k.length <= 16))];

function karistir(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function yeniOyunOlustur() {
  const kelimeler = karistir(TEMIZ_KELIMELER).slice(0, 25);
  
  // Kırmızı 9, Mavi 8, Suikastçı 1, Masum 7
  const renkler = karistir([
    ...Array(9).fill('kirmizi'),
    ...Array(8).fill('mavi'),
    ...Array(1).fill('suikastci'),
    ...Array(7).fill('masum')
  ]);

  const kartlar = kelimeler.map((kelime, i) => ({
    kelime,
    renk: renkler[i],
    acik: false
  }));

  return {
    kartlar,
    siradakiTakim: 'kirmizi', // kırmızı başlar (9 kelimesi var)
    kirmiziBulunan: 0,
    maviBulunan: 0,
    kirmiziHedef: 9,
    maviHedef: 8,
    oyunBitti: false,
    kazanan: null,
    ipucu: null,
    ipucuSayisi: null,
    olusturuldu: Date.now()
  };
}

if (typeof module !== 'undefined') {
  module.exports = { yeniOyunOlustur, TEMIZ_KELIMELER };
}
