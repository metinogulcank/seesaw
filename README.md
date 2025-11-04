Tahterevalli Simülasyonu
========================

Live Demo: metinogulcank.github.io/seesaw

Basit HTML, CSS ve JavaScript ile yazılmış, tork (ağırlık × mesafe) prensibine dayalı bir tahterevalli simülasyonu. Kullanıcı, 400px uzunluğundaki tahta boyunca istediği noktaya tıklayarak 1–10 kg arası nesneler bırakabilir; sistem tork farkına göre tahtayı ±30° aralığında yumuşak biçimde eğer. Durum localStorage'a kaydedilir.

Öne Çıkanlar
-------------
- Tahta üzerinde herhangi bir noktaya tıklayarak nesne bırakma (önizleme ile)
- Tork hesabı: tork = ağırlık × |mesafe|, sağ–sol dengesi ve animasyonlu eğim
- Sıradaki ağırlık ve anlık eğim bilgisi
- Geçmiş listesi (silme ile); temizle ve durdur/başlat kontrolleri
- Kalıcı durum (localStorage); sayfa yenilense de devam eder
- Sadece vanilla: harici kütüphane yok

Hızlı Başlangıç
---------------
1) Bu klasörü bir HTTP sunucusuyla açın veya doğrudan `index.html` dosyasını tarayıcıda başlatın.
   - VS Code Live Server, `npx serve`, veya herhangi bir basit sunucu kullanılabilir.

2) Tahta üzerinde imleci gezdirin. İmlecin hizasında, tahtanın biraz üstünde yarı saydam bir önizleme görünür.

3) Tıklayın; önizleme ağırlığı tam o noktaya bırakılır ve eğim yeni dengeye göre animasyonla güncellenir.

Kontroller ve Arayüz
--------------------
- Sol/sağ toplam: Her iki tarafın toplam ağırlığını gösterir.
- Sıradaki: Bir sonraki bırakılacak ağırlık (1–10 kg rastgele).
- Eğim: Anlık tahta açısı (derece, 30° sınır).
- Temizle: Tüm nesneleri ve açıyı sıfırlar (localStorage da temizlenir).
- Durdur/Başlat: Ekleme ve önizlemeyi geçici olarak devre dışı/etkin kılar.
- Geçmiş: “Pivotun 118px sağına 6 kg eklendi” biçiminde kayıt tutar. Her satırdaki × ile ilgili ağırlığı geri kaldırabilirsiniz.

Fizik ve Görselleştirme
------------------------
- Mesafe tanımı: 400px tahtanın merkezi pivot kabul edilir; sağ pozitif, sol negatif.
- Tork: Her nesne için t = w × |d|. Sağ taraftaki toplam tork − sol taraftaki toplam tork farkı açıyı belirler.
- Açı sınırlaması: ±30° (CSS transition ile yumuşak animasyon).
- Yerleştirme doğruluğu: İmleç, tahtanın mevcut dönüklüğüne göre eksen üzerine projekte edilerek hesaplanır; bu nedenle eğik durumdayken de tıklanan noktaya tam yerleşir.

Özelleştirme (app.js)
---------------------
- `MAX_ANGLE`: Maksimum eğim (varsayılan 30).
- `TORQUE_SCALE`: Tork farkının açıya dönüşüm hassasiyeti. Büyük değer = daha az eğim.
- `CLICK_BAND`: Tahta ekseni etrafındaki tıklama kabul bandı (px). Artırarak tıklamayı kolaylaştırabilirsiniz.

Erişilebilirlik ve Uyumluluk
----------------------------
- Klavye desteği gerekirse eklenebilir; şu an odak fare etkileşimi üzerinedir.
- Modern tarayıcılar hedeflenmiştir (Chrome/Edge/Firefox). Safari'de ses için ilk etkileşim sonrası AudioContext `resume()` çağrısı yapılır.

Alternatif HTML İsimleri Desteği
--------------------------------
Proje, iki farklı isimlendirmeyi destekler (JS ve CSS bu alias'ları tanır):

- İngilizce: `#rotator`, `#objectsLayer`, `.stage`, `#leftTotal`, `#rightTotal`, `#nextWeight`, `#angleText`, `#historyList`, `#clearBtn`, `#pauseBtn`
- Türkçe: `#tahtaAlani`, `#objeler`, `.balance-area`, `#solToplam`, `#sagToplam`, `#siradaki`, `#egim`, `#gecmisListe`, `#temizleBtn`, `#duraklatBtn`

Dosya Yapısı
------------
- `index.html`: Arayüz iskeleti ve kontrol butonları
- `style.css`: Görsel stil, animasyonlar ve geçmiş görünümü
- `app.js`: Tıklama/önizleme, tork hesapları, eğim animasyonu, geçmiş yönetimi, localStorage saklama
