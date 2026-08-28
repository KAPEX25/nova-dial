# Nova Dial

**Nova Dial**, Chromium tabanlı tarayıcılar için geliştirilmiş, Opera GX esintili ve kişiselleştirilebilir bir yeni sekme (Speed Dial) uzantısıdır. Yeni sekme açıldığında saat, arama alanı, kısayollar, önerilen siteler ve seçilebilir RSS haberleri içeren bir ana sayfa gösterir.

## Özellikler

- Manuel kısayol ekleme, düzenleme ve silme
- Google, Bing, DuckDuckGo ve Yandex ile arama; arama önerileri
- Tarayıcının en sık ziyaret edilen sitelerinden öneriler
- Türkçe ve İngilizce arayüz
- Özelleştirilebilir saat, tarih, karşılama ve marka metni
- Vurgu rengi, cam efekti, karartma, kutucuk boyutu ve arka plan bulanıklığı ayarları
- Ekran çözünürlüğüne göre ayrı arka plan görselleri; görsel kırpma, yakınlaştırma ve slayt gösterisi
- Hürriyet, TRT Haber, Habertürk, NTV, BBC News, Hacker News, The Verge veya özel RSS/Atom beslemesinden haberler
- Ayarların, kısayolların ve arka planların JSON olarak dışa/içe aktarımı

## Gereksinimler

- Chrome, Chromium, Microsoft Edge, Brave, Vivaldi, Opera veya Manifest V3 destekleyen başka bir Chromium tabanlı tarayıcı
- Geliştirme paketi hazırlamak için isteğe bağlı olarak Python 3.6+

Haricî npm paketi ya da ayrı bir derleme kurulumu gerekmez.

## Yerel kurulum

1. Tarayıcınızın uzantılar sayfasını açın:
   - Chrome/Chromium/Brave/Vivaldi: `chrome://extensions`
   - Microsoft Edge: `edge://extensions`
   - Opera: `opera://extensions`
2. **Geliştirici modu**nu etkinleştirin.
3. **Paketlenmemiş uzantı yükle / Load unpacked** seçeneğine tıklayın.
4. **Chrome, Chromium, Edge, Brave ve Vivaldi** için `package/` klasörünü seçin.
5. **Opera** için `opera/` klasörünü seçin.
6. Yeni bir sekme açın. Nova Dial otomatik olarak gösterilecektir.

> `package/` içindeki manifest, Chromium tarayıcıların desteklediği `chrome_url_overrides.newtab` ile yeni sekme sayfasını doğrudan değiştirir. Opera bu ayarı desteklemediği için `opera/` çıktısı kullanılır; bu sürüm yeni sekme açılışını `background.js` üzerinden Nova Dial'a yönlendirir. Değişiklik yaptıktan sonra uzantılar sayfasından yeniden yükleyin ve yeni sekmeyi yenileyin.

## Kullanım

- Sağ üstteki dişli simgesiyle ayarları açın.
- Ana ekrandaki `+` kutucuğundan kısayol ekleyin; mevcut bir kısayola tıklayarak düzenleyin.
- **Arkaplan** sekmesinden görsel yükleyin, ekran oranına göre kırpın ve birden fazla görsel için slayt modu seçin.
- **Yedekleme** sekmesinden tüm kişisel verileri JSON dosyasına aktarın veya içe alın.

## Çıktı klasörlerini oluşturma

`build_package.py` iki klasör oluşturur:

- `package/`: Chrome, Chromium, Edge, Brave ve Vivaldi için uzantı çıktısıdır. Manifestine `chrome_url_overrides.newtab` eklenir.
- `opera/`: Opera için çıktıdır. Opera `chrome_url_overrides.newtab` desteklemediğinden bu ayar eklenmez; yeni sekme yönlendirmesi `background.js` ile yapılır.

Betik varsayılan olarak sürüm numarasının son hanesini de artırır.

```powershell
python build_package.py
```

Yalnızca paket oluşturup sürümü değiştirmemek için:

```powershell
python build_package.py --no-bump
```

## Proje yapısı

```text
nova-dial/
├── manifest.json      # Manifest V3 uzantı tanımı ve izinler
├── background.js      # Yeni sekme yönlendirmesi ve ağ istekleri köprüsü
├── newtab.html        # Yeni sekme arayüzü
├── newtab.js          # Uygulama davranışı, ayarlar ve depolama
├── style.css          # Opera GX tarzı görünüm
├── icon.png           # Uzantı simgesi
├── build_package.py   # package/ ve opera/ çıktısını oluşturan betik
├── package/           # Diğer Chromium tarayıcıları için uzantı çıktısı
└── opera/             # Opera için filtrelenmiş kök dizin kopyası
```

## Veri ve izinler

Kişiselleştirme verileri (ayarlar, kısayollar ve yüklenen arka plan görselleri) tarayıcının yerel `chrome.storage` alanında tutulur. Uzantı; arama önerileri ile seçilen haber/RSS kaynaklarını getirebilmek için manifestte tanımlı alan adlarına erişim izni ister. Haber istekleri, CORS kısıtlarını aşabilmek için arka plan servis çalışanı üzerinden yapılır.
