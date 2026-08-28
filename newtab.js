(function () {
  const RES_KEY = `${window.screen.width}x${window.screen.height}`;

  // ---------------------------------------------------------------
  // Storage yardımcıları
  // ---------------------------------------------------------------
  function getStorage(keys) {
    return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  }
  function setStorage(obj) {
    return new Promise((resolve) => chrome.storage.local.set(obj, resolve));
  }

  // ---------------------------------------------------------------
  // Ayarlar - varsayılanlar
  // ---------------------------------------------------------------
  const DEFAULT_SETTINGS = {
    accentColor: "#ff2f6e",
    clockEnabled: true,
    clockFormat: "24",
    dateEnabled: true,
    greetingEnabled: true,
    greetingName: "",
    brandEnabled: true,
    brandText: "Nova Dial",
    searchEnabled: true,
    searchEngine: "google",
    searchAutoFocus: true,
    tilesOpenNewTab: false,
    showAddTile: true,
    showSuggestions: true,
    showSettingsBtn: true,
    maxSuggestions: 16,
    showNews: true,
    newsSource: "",
    customNewsUrl: "",
    overlayOpacity: 45,
    glassBlur: 18,
    tileSize: "medium",
    slideshowMode: "off",
    bgBlur: 0,
    creditEnabled: true,
    language: "tr",
  };

  const ACCENT_PRESETS = [
    "#ff2f6e", "#3fa9ff", "#35d68a", "#b46cff",
    "#ff9f43", "#ff4757", "#18dcff", "#ffd32a",
  ];

  const SEARCH_ENGINES = {
    google: "https://www.google.com/search?q=",
    bing: "https://www.bing.com/search?q=",
    duckduckgo: "https://duckduckgo.com/?q=",
    yandex: "https://yandex.com/search/?text=",
  };

  const SEARCH_ENGINE_DOMAINS = {
    google: "google.com",
    bing: "bing.com",
    duckduckgo: "duckduckgo.com",
    yandex: "yandex.com",
  };

  // chrome.topSites boş dönerse gösterilecek statik yedek liste
  const FALLBACK_SUGGESTED_SITES = [
    { url: "https://www.youtube.com", title: "YouTube" },
    { url: "https://www.wikipedia.org", title: "Wikipedia" },
    { url: "https://www.reddit.com", title: "Reddit" },
    { url: "https://github.com", title: "GitHub" },
    { url: "https://www.instagram.com", title: "Instagram" },
    { url: "https://www.amazon.com", title: "Amazon" },
    { url: "https://www.netflix.com", title: "Netflix" },
    { url: "https://open.spotify.com", title: "Spotify" },
  ];

  const TRANSLATIONS = {
    tr: {
      pageTitle: "Nova Dial",
      settings: "Ayarlar",
      searchPh: "Ara ya da adres yaz...",
      shortcutAdd: "Kısayol Ekle",
      shortcutEdit: "Kısayolu Düzenle",
      name: "İsim",
      namePh: "örn: YouTube",
      url: "Adres",
      urlPh: "örn: youtube.com",
      delete: "Sil",
      cancel: "Vazgeç",
      save: "Kaydet",
      cropTitle: "Fotoğrafı Kırp",
      cropHint: 'Fotoğrafı sürükleyerek konumlandır, kaydırıcıyla yakınlaştır. Çerçeve, ekranının oranına (<b id="crop-res-label">{res}</b>) kilitlendi.',
      zoom: "Yakınlaştır",
      cropSetDefault: "Bunu, eşleşme bulunamayan diğer çözünürlükler için de varsayılan yap",
      reset: "Sıfırla",
      cropSave: "Kırp ve Ekle",
      tabGeneral: "Genel",
      tabAppearance: "Görünüm",
      tabBackground: "Arkaplan",
      tabBackup: "Yedekleme",
      languageLabel: "Dil",
      settingClock: "Saat",
      clockDesc: "Sol üstte saati göster",
      clockFormat: "Saat biçimi",
      clockFormatDesc: "24 saatlik veya 12 saatlik (ÖÖ/ÖS)",
      clock24h: "24 saat",
      clock12h: "12 saat",
      settingDate: "Tarih",
      dateDesc: "Saatin altında günü/tarihi göster",
      settingGreeting: "Karşılama mesajı",
      greetingDesc: 'Saate göre değişen "Günaydın" gibi bir selam göster',
      greetingNamePh: "İsmin (örn: Ahmet)",
      settingBrand: "Marka yazısı",
      brandDesc: 'Üstteki "Nova Dial" yazısını göster',
      brandPh: "Marka yazısı",
      settingSearch: "Arama çubuğu",
      searchDesc: "Kısayolların üstündeki arama kutusunu göster",
      settingSearchEngine: "Arama motoru",
      searchEngineDesc: "Yazı aratıldığında hangi motor kullanılsın",
      settingAutoFocus: "Otomatik odaklan",
      autofocusDesc: "Sekme açılınca imleç arama kutusunda hazır beklesin",
      settingTilesNewTab: "Kısayollar yeni sekmede açılsın",
      tilesNewTabDesc: "Kapalıysa aynı sekmede açılır",
      showAddTile: "Kısayol ekle butonu",
      showAddTileDesc: "Ana ekranda sağdaki '+' ekleme kutucuğunu göster",
      showSuggestions: "Önerilen siteler",
      showSuggestionsDesc: "Kısayolların bir altında popüler site önerilerini göster",
      showSettingsBtn: "Ayarlar butonu",
      showSettingsBtnDesc: "Kapalıyken fare ekranın sağ kenarına gelince buton kayarak görünür",
      maxSuggestions: "Öneri sayısı",
      maxSuggestionsDesc: "Önerilen bölümde en fazla kaç site gösterileceği",
      newsTitle: "Haberler",
      showNews: "Haberler",
      showNewsDesc: "Önerilerin altında seçili kaynaktan güncel haberleri göster",
      newsSource: "Haber kaynağı",
      newsSourceDesc: "Haberlerin hangi kaynaktan getirileceği",
      newsCustom: "Özel (RSS)",
      customNewsTitle: "Özel RSS adresi",
      customNewsDesc: "Kendi RSS veya Atom besleme adresini gir",
      customNewsPh: "https://ornek.com/haberler.xml",
      newsError: "Haberler yüklenemedi",
      newsNow: "şimdi",
      newsMinAgo: "{n} dk önce",
      newsHourAgo: "{n} sa önce",
      newsDayAgo: "{n} gün önce",
      suggestionsTitle: "Önerilen",
      settingCredit: "İmza yazısı",
      creditDesc: "Sağ altta küçük bir imza gösterir",
      accentColor: "Vurgu rengi",
      accentColorDesc: "Butonlar, çerçeveler ve ışıltı efektinin rengi",
      customColor: "Özel renk seç",
      overlay: "Karartma yoğunluğu",
      overlayDesc: "Arkaplan fotoğrafının üstündeki koyu katman — yazıların okunurluğunu etkiler",
      glassBlur: "Cam efekti (blur) yoğunluğu",
      glassBlurDesc: "Arama kutusu, kısayollar ve panellerdeki buzlu cam efekti",
      tileSize: "Kısayol kutucuk boyutu",
      tileSizeDesc: "Ana ekrandaki kısayol ikonlarının büyüklüğü",
      tileSmall: "Küçük",
      tileMedium: "Orta",
      tileLarge: "Büyük",
      currentResLabel: "Şu anki ekran çözünürlüğün:",
      bgHint: "Bu çözünürlük için fotoğraf ekle — bilgisayarın başka bir çözünürlükte açıldığında farklı bir fotoğraf otomatik gösterilecek (örn. 1920x1080 yerine 1440x900). Aynı çözünürlüğe birden fazla fotoğraf ekleyebilirsin.",
      dropzoneText: "Fotoğrafı buraya sürükle bırak <span>ya da tıklayıp seç</span>",
      multiPhoto: "Birden fazla fotoğraf varsa",
      multiPhotoDesc: "Her yeni sekmede farklı bir fotoğraf göster",
      slideshowOff: "Hep ilki",
      slideshowSeq: "Sırayla değiştir",
      slideshowRandom: "Rastgele değiştir",
      bgBlurTitle: "Arkaplan bulanıklığı",
      bgBlurDesc: "Fotoğrafın kendisini hafifçe bulanıklaştırır",
      backupHint: "Tüm ayarlarını, kısayollarını ve arkaplan fotoğraflarını bir dosyaya kaydet, istersen başka bir bilgisayara aktar.",
      exportTitle: "Dışa aktar",
      exportDesc: "Her şeyi bir .json dosyası olarak indir",
      download: "İndir",
      importTitle: "İçe aktar",
      importDesc: "Daha önce indirdiğin .json dosyasını yükle",
      chooseFile: "Dosya Seç",
      clearTitle: "Tüm kısayolları sil",
      clearDesc: "Sadece kısayolları temizler, ayarlar ve fotoğraflar kalır",
      clear: "Temizle",
      resetAllTitle: "Fabrika ayarlarına dön",
      resetAllDesc: "Her şeyi siler: kısayollar, fotoğraflar, ayarlar",
      close: "Kapat",
      add: "Ekle",
      edit: "Düzenle",
      remove: "Kaldır",
      importErr: "Dosya okunamadı. Lütfen daha önce bu eklentiden indirdiğin bir yedek dosyası seç.",
      clearConfirm: "Tüm kısayollar silinsin mi? Bu işlem geri alınamaz.",
      exportName: "yedek",
      resetConfirm: "Tüm ayarlar, kısayollar ve arkaplan fotoğrafları silinip fabrika ayarlarına dönülsün mü? Bu işlem geri alınamaz.",
      noBackground: "Henüz kayıtlı arkaplan yok.",
      defaultBg: "Varsayılan",
      currentScreen: "şu anki ekran",
      photoCount: "fotoğraf",
      greetNight: "İyi geceler",
      greetMorning: "Günaydın",
      greetDay: "İyi günler",
      greetEvening: "İyi akşamlar",
    },
    en: {
      pageTitle: "Nova Dial",
      settings: "Settings",
      searchPh: "Search or type a URL...",
      shortcutAdd: "Add Shortcut",
      shortcutEdit: "Edit Shortcut",
      name: "Name",
      namePh: "e.g. YouTube",
      url: "URL",
      urlPh: "e.g. youtube.com",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save",
      cropTitle: "Crop Photo",
      cropHint: 'Drag the photo to position it and use the slider to zoom. The frame is locked to your screen ratio (<b id="crop-res-label">{res}</b>).',
      zoom: "Zoom",
      cropSetDefault: "Also use this as the default for other resolutions without a match",
      reset: "Reset",
      cropSave: "Crop & Add",
      tabGeneral: "General",
      tabAppearance: "Appearance",
      tabBackground: "Background",
      tabBackup: "Backup",
      languageLabel: "Language",
      settingClock: "Clock",
      clockDesc: "Show the clock in the top-left",
      clockFormat: "Clock format",
      clockFormatDesc: "24-hour or 12-hour (AM/PM)",
      clock24h: "24-hour",
      clock12h: "12-hour",
      settingDate: "Date",
      dateDesc: "Show the day/date below the clock",
      settingGreeting: "Greeting",
      greetingDesc: 'Show a time-based greeting like "Good morning"',
      greetingNamePh: "Your name (e.g. Alex)",
      settingBrand: "Brand text",
      brandDesc: 'Show the "Nova Dial" text at the top',
      brandPh: "Brand text",
      settingSearch: "Search bar",
      searchDesc: "Show the search box above the shortcuts",
      settingSearchEngine: "Search engine",
      searchEngineDesc: "Which engine to use when searching",
      settingAutoFocus: "Auto-focus",
      autofocusDesc: "Focus the search box when a tab opens",
      settingTilesNewTab: "Open shortcuts in a new tab",
      tilesNewTabDesc: "Open in the same tab when off",
      showAddTile: "Add shortcut button",
      showAddTileDesc: "Show the '+' add tile on the main screen",
      showSuggestions: "Suggested sites",
      showSuggestionsDesc: "Show popular site suggestions below the shortcuts",
      showSettingsBtn: "Settings button",
      showSettingsBtnDesc: "When off, move the mouse to the right screen edge to slide the button in",
      maxSuggestions: "Suggestion count",
      maxSuggestionsDesc: "Maximum number of sites shown in the suggestions section",
      newsTitle: "News",
      showNews: "News",
      showNewsDesc: "Show latest news from the selected source below the suggestions",
      newsSource: "News source",
      newsSourceDesc: "Which source the news are fetched from",
      newsCustom: "Custom (RSS)",
      customNewsTitle: "Custom RSS URL",
      customNewsDesc: "Enter your own RSS or Atom feed URL",
      customNewsPh: "https://example.com/news.xml",
      newsError: "Couldn't load news",
      newsNow: "now",
      newsMinAgo: "{n}m ago",
      newsHourAgo: "{n}h ago",
      newsDayAgo: "{n}d ago",
      suggestionsTitle: "Suggested",
      settingCredit: "Signature text",
      creditDesc: "Shows a small signature in the bottom-right corner",
      accentColor: "Accent color",
      accentColorDesc: "Color of buttons, frames and the glow effect",
      customColor: "Choose a custom color",
      overlay: "Dimming intensity",
      overlayDesc: "The dark layer over the background — affects text readability",
      glassBlur: "Glass (blur) intensity",
      glassBlurDesc: "Frosted-glass effect on the search box, tiles and panels",
      tileSize: "Shortcut tile size",
      tileSizeDesc: "Size of the shortcut icons on the main screen",
      tileSmall: "Small",
      tileMedium: "Medium",
      tileLarge: "Large",
      currentResLabel: "Your current screen resolution:",
      bgHint: "Add a photo for this resolution — when your computer opens at a different resolution (e.g. 1440x900 instead of 1920x1080), a different photo is shown automatically. You can add multiple photos for the same resolution.",
      dropzoneText: "Drag and drop a photo here <span>or click to select</span>",
      multiPhoto: "If you have multiple photos",
      multiPhotoDesc: "Show a different photo on each new tab",
      slideshowOff: "Always first",
      slideshowSeq: "Rotate in order",
      slideshowRandom: "Rotate randomly",
      bgBlurTitle: "Background blur",
      bgBlurDesc: "Slightly blurs the photo itself",
      backupHint: "Save all your settings, shortcuts and background photos to a file, and import it on another computer if you want.",
      exportTitle: "Export",
      exportDesc: "Download everything as a .json file",
      download: "Download",
      importTitle: "Import",
      importDesc: "Load a .json file you downloaded before",
      chooseFile: "Choose File",
      clearTitle: "Delete all shortcuts",
      clearDesc: "Only clears shortcuts, keeps settings and photos",
      clear: "Clear",
      resetAllTitle: "Restore to factory settings",
      resetAllDesc: "Deletes everything: shortcuts, photos, settings",
      close: "Close",
      add: "Add",
      edit: "Edit",
      remove: "Remove",
      importErr: "Could not read the file. Please choose a backup file you downloaded from this extension before.",
      clearConfirm: "Delete all shortcuts? This cannot be undone.",
      exportName: "backup",
      resetConfirm: "Reset all settings, shortcuts and background photos to factory defaults? This cannot be undone.",
      noBackground: "No saved backgrounds yet.",
      defaultBg: "Default",
      currentScreen: "current screen",
      photoCount: "photos",
      greetNight: "Good evening",
      greetMorning: "Good morning",
      greetDay: "Good afternoon",
      greetEvening: "Good evening",
    },
  };

  function t(key) {
    const lang = settings.language === "en" ? "en" : "tr";
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.tr[key] || key;
  }

  let settings = { ...DEFAULT_SETTINGS };

  function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  async function loadSettings() {
    const { settings: stored } = await getStorage(["settings"]);
    settings = { ...DEFAULT_SETTINGS, ...(stored || {}) };
  }
  async function saveSettings() {
    await setStorage({ settings });
  }

  function applySettings() {
    const root = document.documentElement;
    root.style.setProperty("--accent", settings.accentColor);
    root.style.setProperty("--accent-glow", hexToRgba(settings.accentColor, 0.55));
    root.style.setProperty("--overlay-opacity", (settings.overlayOpacity / 100).toFixed(2));
    root.style.setProperty("--glass-blur", settings.glassBlur + "px");
    root.style.setProperty("--bg-blur", settings.bgBlur + "px");
    root.style.setProperty("--bg-scale", settings.bgBlur > 0 ? "1.08" : "1");

    const tileSizes = { small: [48, 88], medium: [60, 104], large: [76, 122] };
    const [iconPx, colPx] = tileSizes[settings.tileSize] || tileSizes.medium;
    root.style.setProperty("--tile-icon", iconPx + "px");
    root.style.setProperty("--tile-col", colPx + "px");

    document.getElementById("clock").classList.toggle("hidden", !settings.clockEnabled);
    document.getElementById("clock-date").classList.toggle("hidden", !settings.dateEnabled);
    document.getElementById("brand").classList.toggle("hidden", !settings.brandEnabled);
    document.getElementById("brand").innerHTML = settings.brandText.includes(" ")
      ? settings.brandText.replace(/(.*)\s(\S+)$/, '$1 <span>$2</span>')
      : `<span>${settings.brandText}</span>`;

    document.getElementById("search-form").classList.toggle("hidden", !settings.searchEnabled);
    document.getElementById("credit").classList.toggle("hidden", !settings.creditEnabled);

    // Ayarlar butonu + sağ kenar algı bölgesi (buton kapalıyken fare gelince kayarak görünür)
    const showSettings = settings.showSettingsBtn !== false;
    const settingsBtnNode = document.getElementById("settings-btn");
    settingsBtnNode.classList.remove("hidden");
    settingsBtnNode.classList.toggle("edge-hidden", !showSettings);
    settingsBtnNode.classList.remove("peeked");
    document.getElementById("settings-hotspot").classList.toggle("hidden", showSettings);

    const domain = SEARCH_ENGINE_DOMAINS[settings.searchEngine] || SEARCH_ENGINE_DOMAINS.google;
    document.getElementById("search-engine-icon").src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    updateGreeting();
  }

  function updateGreeting() {
    const el = document.getElementById("greeting");
    if (!settings.greetingEnabled) {
      el.textContent = "";
      return;
    }
    const h = new Date().getHours();
    let salute = t("greetNight");
    if (h >= 5 && h < 12) salute = t("greetMorning");
    else if (h >= 12 && h < 18) salute = t("greetDay");
    else if (h >= 18 && h < 22) salute = t("greetEvening");
    const name = settings.greetingName.trim();
    el.textContent = name ? `${salute}, ${name}!` : `${salute}!`;
  }

  // ---------------------------------------------------------------
  // Saat
  // ---------------------------------------------------------------
  function currentLocale() {
    return settings.language === "en" ? "en-US" : "tr-TR";
  }
  function tickClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString(currentLocale(), {
      hour: "2-digit",
      minute: "2-digit",
      hour12: settings.clockFormat === "12",
    });
    const dateStr = now.toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" });
    document.getElementById("clock-time").textContent = timeStr;
    document.getElementById("clock-date").textContent = dateStr;
  }
  setInterval(() => { tickClock(); updateGreeting(); }, 10000);

  function applyLanguage() {
    const lang = settings.language === "en" ? "en" : "tr";
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });

    const resLabel = document.getElementById("current-res-label");
    if (resLabel) resLabel.textContent = t("currentResLabel");

    const cropHint = document.getElementById("crop-hint");
    if (cropHint) cropHint.innerHTML = t("cropHint").replace("{res}", RES_KEY);

    updateGreeting();
    tickClock();
    populateNewsSourceOptions();
    try { renderTiles(); renderNews(true); } catch (e) { /* ön yüklemede henüz tanımsız olabilir */ }
  }

  // ---------------------------------------------------------------
  // Arkaplan (çoklu fotoğraf + slayt gösterisi + migrasyon)
  // ---------------------------------------------------------------
  async function migrateWallpapers() {
    const { wallpapers } = await getStorage(["wallpapers"]);
    if (!wallpapers) return {};
    let changed = false;
    const map = {};
    for (const key of Object.keys(wallpapers)) {
      const val = wallpapers[key];
      if (typeof val === "string") {
        map[key] = [val];
        changed = true;
      } else if (Array.isArray(val)) {
        map[key] = val;
      }
    }
    if (changed) await setStorage({ wallpapers: map });
    return map;
  }

  async function pickWallpaperIndex(resKey, list) {
    if (list.length <= 1 || settings.slideshowMode === "off") return 0;
    if (settings.slideshowMode === "random") {
      return Math.floor(Math.random() * list.length);
    }
    // sıralı
    const { wallpaperIndexes } = await getStorage(["wallpaperIndexes"]);
    const indexes = wallpaperIndexes || {};
    const next = ((indexes[resKey] || 0) + 1) % list.length;
    indexes[resKey] = next;
    await setStorage({ wallpaperIndexes: indexes });
    return next;
  }

  async function applyBackground() {
    const map = await migrateWallpapers();
    const bg = document.getElementById("bg");
    const list = map[RES_KEY] || map["default"] || [];
    const usedKey = map[RES_KEY] ? RES_KEY : "default";

    if (list.length > 0) {
      const idx = await pickWallpaperIndex(usedKey, list);
      bg.style.backgroundImage = `url("${list[idx]}")`;
    } else {
      bg.style.background = "linear-gradient(160deg, #1a1a22, #0b0b0f)";
    }
  }

  // ---------------------------------------------------------------
  // Arama
  // ---------------------------------------------------------------
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const suggestBox = document.getElementById("search-suggest");

  // --- Arama önerileri (otomatik tamamlama) ---
  let suggestAbort = null;
  let suggestItems = [];
  let suggestIndex = -1;

  function suggestUrlFor(q) {
    const enc = encodeURIComponent(q);
    const engine = settings.searchEngine || "google";
    if (engine === "bing") return `https://www.bing.com/osjson.aspx?query=${enc}`;
    if (engine === "duckduckgo" || engine === "yandex") return `https://duckduckgo.com/ac/?q=${enc}&type=list`;
    return `https://suggestqueries.google.com/complete/search?client=firefox&q=${enc}`;
  }

  function parseSuggestions(data) {
    // google/bing: [sorgu, [öneri1, öneri2, ...]]
    if (Array.isArray(data) && Array.isArray(data[1])) return data[1];
    // duckduckgo: ["öneri1", "öneri2", ...]
    if (Array.isArray(data)) return data;
    return [];
  }

  function closeSuggest() {
    if (suggestAbort) { suggestAbort.abort(); suggestAbort = null; }
    suggestBox.classList.add("hidden");
    suggestItems = [];
    suggestIndex = -1;
    input.setAttribute("aria-expanded", "false");
  }

  function highlightMatch(text, q) {
    const qq = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${qq})`, "ig");
    return text.replace(re, '<b style="color:var(--accent)">$1</b>');
  }

  function showSuggest(items) {
    suggestItems = items;
    suggestIndex = -1;
    if (!items.length) { closeSuggest(); return; }
    const q = input.value;
    suggestBox.innerHTML = items.map((s, i) =>
      `<li role="option" data-i="${i}"><span class="sug-text">${highlightMatch(escapeHtml(s), q)}</span></li>`
    ).join("");
    suggestBox.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function pickSuggestion(i) {
    const idx = i >= 0 ? i : suggestIndex;
    const s = suggestItems[idx];
    if (s) {
      input.value = s;
      closeSuggest();
      doSearch(s);
    }
  }

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (suggestAbort) suggestAbort.abort();
    if (!q) { closeSuggest(); return; }

    const ctrl = new AbortController();
    suggestAbort = ctrl;
    fetch(suggestUrlFor(q), { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (ctrl.signal.aborted) return;
        showSuggest(parseSuggestions(data, settings.searchEngine).slice(0, 8));
      })
      .catch(() => { if (!ctrl.signal.aborted) closeSuggest(); });
  });

  function doSearch(q) {
    if (!q) return;
    const looksLikeUrl = /^[^\s]+\.[^\s]{2,}$/.test(q) && !q.includes(" ");
    const engineBase = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.google;
    window.location.href = looksLikeUrl
      ? (q.startsWith("http") ? q : `https://${q}`)
      : `${engineBase}${encodeURIComponent(q)}`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (suggestIndex >= 0) { pickSuggestion(suggestIndex); return; }
    doSearch(input.value.trim());
  });

  // Klavye gezinme
  input.addEventListener("keydown", (e) => {
    if (suggestBox.classList.contains("hidden")) return;
    const len = suggestItems.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      suggestIndex = (suggestIndex + 1) % len;
      markActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      suggestIndex = (suggestIndex - 1 + len) % len;
      markActive();
    } else if (e.key === "Escape") {
      closeSuggest();
    }
  });

  function markActive() {
    [...suggestBox.children].forEach((li, i) => {
      li.classList.toggle("active", i === suggestIndex);
    });
  }

  suggestBox.addEventListener("mousedown", (e) => {
    e.preventDefault(); // input blur yarışmasını önle
    const li = e.target.closest("li");
    if (li) {
      const i = [...suggestBox.children].indexOf(li);
      pickSuggestion(i);
    }
  });

  document.addEventListener("click", (e) => {
    if (!form.contains(e.target)) closeSuggest();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input && !isModalOpen()) {
      e.preventDefault();
      input.focus();
    }
    if (e.key === "Escape") {
      closeAllModals();
    }
  });

  function isModalOpen() {
    return !document.getElementById("shortcut-modal").classList.contains("hidden")
      || !document.getElementById("settings-modal").classList.contains("hidden")
      || !document.getElementById("crop-modal").classList.contains("hidden");
  }
  function closeAllModals() {
    document.getElementById("shortcut-modal").classList.add("hidden");
    document.getElementById("settings-modal").classList.add("hidden");
    document.getElementById("crop-modal").classList.add("hidden");
  }

  // ---------------------------------------------------------------
  // Kısayollar
  // ---------------------------------------------------------------
  const tilesContainer = document.getElementById("tiles");
  let shortcuts = [];
  let editingId = null;
  let dragSrcId = null;

  function faviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return "";
    }
  }

  function normalizeUrl(raw) {
    let u = raw.trim();
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    return u;
  }

  async function loadShortcuts() {
    const { shortcuts: stored } = await getStorage(["shortcuts"]);
    shortcuts = stored || [];
    renderTiles();
  }

  async function saveShortcuts() {
    await setStorage({ shortcuts });
  }

  function renderTiles() {
    tilesContainer.innerHTML = "";

    shortcuts.forEach((s) => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.draggable = true;
      tile.dataset.id = s.id;

      const iconBox = document.createElement("div");
      iconBox.className = "tile-icon";
      const img = document.createElement("img");
      img.src = faviconUrl(s.url);
      img.onerror = () => {
        iconBox.innerHTML = "";
        iconBox.textContent = (s.name || "?").charAt(0).toUpperCase();
      };
      iconBox.appendChild(img);

      const label = document.createElement("div");
      label.className = "tile-label";
      label.textContent = s.name;

      const editBtn = document.createElement("div");
      editBtn.className = "tile-edit-btn";
      editBtn.textContent = "✎";
      editBtn.title = t("edit");
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openShortcutModal(s);
      });

      tile.appendChild(editBtn);
      tile.appendChild(iconBox);
      tile.appendChild(label);

      tile.addEventListener("click", (e) => {
        e.preventDefault();
        if (settings.tilesOpenNewTab) {
          window.open(s.url, "_blank");
        } else {
          window.location.href = s.url;
        }
      });

      // Sürükle-bırak ile sıralama
      tile.addEventListener("dragstart", () => {
        dragSrcId = s.id;
        tile.classList.add("dragging");
      });
      tile.addEventListener("dragend", () => tile.classList.remove("dragging"));
      tile.addEventListener("dragover", (e) => {
        e.preventDefault();
        tile.classList.add("drag-over");
      });
      tile.addEventListener("dragleave", () => tile.classList.remove("drag-over"));
      tile.addEventListener("drop", (e) => {
        e.preventDefault();
        tile.classList.remove("drag-over");
        if (dragSrcId === null || dragSrcId === s.id) return;
        const fromIdx = shortcuts.findIndex((x) => x.id === dragSrcId);
        const toIdx = shortcuts.findIndex((x) => x.id === s.id);
        const [moved] = shortcuts.splice(fromIdx, 1);
        shortcuts.splice(toIdx, 0, moved);
        saveShortcuts();
        renderTiles();
      });

      tilesContainer.appendChild(tile);
    });

    // Ekle kutucuğu
    if (settings.showAddTile !== false) {
      const addTile = document.createElement("div");
      addTile.className = "tile tile-add";
      addTile.innerHTML = `
      <div class="tile-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <div class="tile-label">${t("add")}</div>
    `;
      addTile.addEventListener("click", () => openShortcutModal(null));
      tilesContainer.appendChild(addTile);
    }

    renderSuggestions();
    renderNews();
  }

  let cachedTopSites = null;

  function renderSuggestions() {
    const box = document.getElementById("suggestions");
    if (!box) return;
    const isVisible = settings.showSuggestions !== false;
    box.classList.toggle("hidden", !isVisible);
    if (!isVisible) return;
    const list = document.getElementById("suggestions-list");
    const title = document.getElementById("suggestions-title");
    if (title) title.textContent = t("suggestionsTitle");
    list.innerHTML = "";

    const render = (sites) => {
      list.innerHTML = "";
      const max = Math.max(1, Math.round(Number(settings.maxSuggestions) || 16));
      const shown = (sites || []).slice(0, max);
      if (!shown.length) { box.classList.add("hidden"); return; }
      shown.forEach((s) => {
        const url = s.url;
        const name = s.title || url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

        const item = document.createElement("div");
        item.className = "suggest-item";
        item.title = name;

        const icon = document.createElement("div");
        icon.className = "tile-icon"; // kısayol ikonuyla aynı boyut/boşlu
        const img = document.createElement("img");
        img.src = faviconUrl(url);
        img.alt = "";
        img.onerror = () => {
          img.style.visibility = "hidden";
          if (!icon.firstChild) icon.textContent = (name || "?").charAt(0).toUpperCase();
        };
        icon.appendChild(img);

        const label = document.createElement("div");
        label.className = "tile-label"; // kısayol etiketiyle aynı stil
        label.textContent = name;

        item.appendChild(icon);
        item.appendChild(label);

        item.addEventListener("click", (e) => {
          e.preventDefault();
          if (settings.tilesOpenNewTab) window.open(url, "_blank");
          else window.location.href = url;
        });

        list.appendChild(item);
      });
      box.classList.remove("hidden");
    };

    const fallback = () => render(FALLBACK_SUGGESTED_SITES);

    if (cachedTopSites !== null) {
      if (cachedTopSites.length) render(cachedTopSites);
      else fallback();
      return;
    }
    if (chrome.topSites && chrome.topSites.get) {
      try {
        const result = chrome.topSites.get();
        if (result && typeof result.then === "function") {
          result.then((sites) => {
            cachedTopSites = sites || [];
            if (sites && sites.length) render(sites);
            else fallback();
          }).catch(() => fallback());
        } else {
          result((sites) => {
            cachedTopSites = sites || [];
            if (sites && sites.length) render(sites);
            else fallback();
          });
        }
      } catch {
        fallback();
      }
    } else {
      fallback();
    }
  }

  // ---- Haberler ----
  const NEWS_SOURCES = {
    hurriyet: { name: "Hürriyet", url: "https://www.hurriyet.com.tr/rss/anasayfa" },
    trt: { name: "TRT Haber", url: "https://www.trthaber.com/sondakika.rss" },
    haberturk: { name: "Habertürk", url: "https://www.haberturk.com/rss/manset.xml" },
    ntv: { name: "NTV", url: "https://www.ntv.com.tr/gundem.rss" },
    bbc: { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    hackernews: { name: "Hacker News", url: "https://hnrss.org/frontpage" },
    verge: { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
  };
  const NEWS_GROUPS = {
    tr: ["hurriyet", "trt", "haberturk", "ntv"],
    en: ["bbc", "hackernews", "verge"],
  };
  const NEWS_TTL = 10 * 60 * 1000; // 10 dakika önbellek
  const NEWS_MAX = 6;
  let newsMemCache = null;
  let newsDrawnKey = null;

  function resolveNewsSource() {
    if (settings.newsSource === "custom") {
      const u = (settings.customNewsUrl || "").trim();
      if (/^https?:\/\//i.test(u)) return { key: "custom:" + u, name: t("newsCustom"), url: u };
    }
    if (NEWS_SOURCES[settings.newsSource]) {
      const s = NEWS_SOURCES[settings.newsSource];
      return { key: settings.newsSource, name: s.name, url: s.url };
    }
    const lang = settings.language === "en" ? "en" : "tr";
    const def = NEWS_GROUPS[lang][0];
    const s = NEWS_SOURCES[def];
    return { key: def, name: s.name, url: s.url };
  }

  function populateNewsSourceOptions() {
    const sel = document.getElementById("opt-news-source");
    if (!sel) return;
    const lang = settings.language === "en" ? "en" : "tr";
    sel.innerHTML = "";
    NEWS_GROUPS[lang].forEach((k) => {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = NEWS_SOURCES[k].name;
      sel.appendChild(o);
    });
    const oc = document.createElement("option");
    oc.value = "custom";
    oc.textContent = t("newsCustom");
    sel.appendChild(oc);
    const valid = NEWS_GROUPS[lang].includes(settings.newsSource) || settings.newsSource === "custom";
    const newVal = valid ? settings.newsSource : NEWS_GROUPS[lang][0];
    sel.value = newVal;
    if (settings.newsSource !== newVal) {
      settings.newsSource = newVal;
      saveSettings();
    }
    updateNewsCustomRow();
  }

  function updateNewsCustomRow() {
    const row = document.getElementById("row-news-custom");
    if (row) row.classList.toggle("hidden", settings.newsSource !== "custom");
  }

  function relTimeStr(dateStr) {
    const d = dateStr ? new Date(dateStr) : null;
    if (!d || isNaN(d.getTime())) return "";
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 1) return t("newsNow");
    if (m < 60) return t("newsMinAgo").replace("{n}", m);
    const h = Math.floor(m / 60);
    if (h < 24) return t("newsHourAgo").replace("{n}", h);
    return t("newsDayAgo").replace("{n}", Math.floor(h / 24));
  }

  async function getNewsCache(sourceKey, force) {
    if (!force) {
      if (newsMemCache && newsMemCache.source === sourceKey && Date.now() - newsMemCache.ts < NEWS_TTL) {
        return newsMemCache;
      }
      try {
        if (chrome.storage && chrome.storage.session) {
          const o = await chrome.storage.session.get("news_" + sourceKey);
          const c = o["news_" + sourceKey];
          if (c && c.items && c.items.length && Date.now() - c.ts < NEWS_TTL) return c;
        }
      } catch {}
    }
    return null;
  }

  async function setNewsCache(sourceKey, items) {
    newsMemCache = { source: sourceKey, ts: Date.now(), items };
    try {
      if (chrome.storage && chrome.storage.session) {
        await chrome.storage.session.set({ ["news_" + sourceKey]: newsMemCache });
      }
    } catch {}
  }

  // Metni çek: önce background service worker üzerinden (manifest'teki
  // host_permissions sayesinde CORS engeline takılmaz). SW yolu başarısızsa
  // (ör. worker henüz uyandıysa/hata verdiyse) sayfadan doğrudan dene.
  async function fetchTextVia(url) {
    try {
      if (chrome.runtime && chrome.runtime.id) {
        const resp = await new Promise((resolve, reject) => {
          try {
            chrome.runtime.sendMessage({ type: "FETCH_URL", url: url }, (r) => {
              if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
              else resolve(r);
            });
          } catch (err) { reject(err); }
        });
        if (resp && resp.ok && typeof resp.text === "string") return resp.text;
        throw new Error("SW " + ((resp && resp.status) || "") + ((resp && resp.error) ? " " + resp.error : ""));
      }
    } catch {}
    // SW üzerinden olmazsa doğrudan (host_permissions varsa yine CORS'suz çalışır)
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.text();
  }

  // RSS (item) ve Atom (entry) beslemelerini destekler
  async function fetchFeedWith(url) {
    const text = await fetchTextVia(url);
    const doc = new DOMParser().parseFromString(text, "text/xml");
    if (doc.querySelector("parsererror")) throw new Error("XML hatası");
    let nodes = [...doc.querySelectorAll("item")];
    if (!nodes.length) nodes = [...doc.querySelectorAll("entry")];
    return nodes.slice(0, NEWS_MAX).map((it) => {
      const tEl = it.querySelector("title");
      const lEl = it.querySelector("link");
      const link = lEl ? (lEl.getAttribute("href") || lEl.textContent || "").trim() : "";
      const dEl = it.querySelector("pubDate") || it.querySelector("published") || it.querySelector("updated");
      return {
        title: tEl ? tEl.textContent.trim() : "",
        link: link,
        date: dEl ? dEl.textContent.trim() : "",
      };
    }).filter((n) => n.title && n.link);
  }

  async function fetchNewsFeed(url) {
    try {
      return await fetchFeedWith(url);
    } catch (e) {
      // Doğrudan çekilemezse (CORS/bot engeli) herkese açık CORS proxy'leri üzerinden dene
      const proxies = [
        "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
        "https://corsproxy.io/?url=" + encodeURIComponent(url),
        "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(url),
      ];
      let lastErr = e;
      for (const p of proxies) {
        try { return await fetchFeedWith(p); } catch (err) { lastErr = err; }
      }
      throw lastErr;
    }
  }

  function renderNews(force) {
    const box = document.getElementById("news");
    if (!box) return;
    const isVisible = settings.showNews !== false;
    if (!isVisible) {
      box.classList.add("hidden");
      newsDrawnKey = null;
      return;
    }
    const title = document.getElementById("news-title");
    if (title) title.textContent = t("newsTitle");
    const list = document.getElementById("news-list");
    const src = resolveNewsSource();

    // Aynı kaynak zaten çiziliyse tekrar fetch/çizme (titremeyi önler)
    if (!force && newsDrawnKey === src.key && list.children.length) return;

    const draw = (items) => {
      list.innerHTML = "";
      items.forEach((n) => {
        const item = document.createElement("div");
        item.className = "news-item";
        item.title = n.title;
        const tEl = document.createElement("div");
        tEl.className = "news-item-title";
        tEl.textContent = n.title;
        const meta = document.createElement("div");
        meta.className = "news-item-meta";
        const when = relTimeStr(n.date);
        meta.textContent = when ? src.name + " · " + when : src.name;
        item.appendChild(tEl);
        item.appendChild(meta);
        item.addEventListener("click", (e) => {
          e.preventDefault();
          if (settings.tilesOpenNewTab) window.open(n.link, "_blank");
          else window.location.href = n.link;
        });
        list.appendChild(item);
      });
      box.classList.remove("hidden");
      newsDrawnKey = src.key;
    };
    const showError = () => {
      list.innerHTML = "";
      const p = document.createElement("p");
      p.className = "news-error";
      p.textContent = t("newsError");
      list.appendChild(p);
      box.classList.remove("hidden");
      newsDrawnKey = src.key;
    };

    (async () => {
      const cached = await getNewsCache(src.key, force === true);
      if (cached && cached.items && cached.items.length) { draw(cached.items); return; }
      try {
        const items = await fetchNewsFeed(src.url);
        if (items.length) await setNewsCache(src.key, items);
        if (items.length) draw(items);
        else showError();
      } catch {
        showError();
      }
    })();
  }

  // ---- Kısayol modalı ----
  const shortcutModal = document.getElementById("shortcut-modal");
  const shortcutTitle = document.getElementById("shortcut-modal-title");
  const nameInput = document.getElementById("shortcut-name");
  const urlInput = document.getElementById("shortcut-url");
  const deleteBtn = document.getElementById("shortcut-delete");

  function openShortcutModal(existing) {
    editingId = existing ? existing.id : null;
    shortcutTitle.textContent = existing ? t("shortcutEdit") : t("shortcutAdd");
    nameInput.value = existing ? existing.name : "";
    urlInput.value = existing ? existing.url.replace(/^https?:\/\//, "") : "";
    deleteBtn.classList.toggle("hidden", !existing);
    shortcutModal.classList.remove("hidden");
    setTimeout(() => nameInput.focus(), 50);
  }
  function closeShortcutModal() {
    shortcutModal.classList.add("hidden");
    editingId = null;
  }

  document.getElementById("shortcut-cancel").addEventListener("click", closeShortcutModal);
  shortcutModal.addEventListener("click", (e) => {
    if (e.target === shortcutModal) closeShortcutModal();
  });

  document.getElementById("shortcut-save").addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const rawUrl = urlInput.value.trim();
    if (!name || !rawUrl) return;
    const url = normalizeUrl(rawUrl);

    if (editingId) {
      const idx = shortcuts.findIndex((s) => s.id === editingId);
      if (idx !== -1) shortcuts[idx] = { ...shortcuts[idx], name, url };
    } else {
      shortcuts.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, url });
    }
    await saveShortcuts();
    renderTiles();
    closeShortcutModal();
  });

  deleteBtn.addEventListener("click", async () => {
    shortcuts = shortcuts.filter((s) => s.id !== editingId);
    await saveShortcuts();
    renderTiles();
    closeShortcutModal();
  });

  // ---------------------------------------------------------------
  // Fotoğraf kırpma aracı
  // ---------------------------------------------------------------
  const cropModal = document.getElementById("crop-modal");
  const cropFrame = document.getElementById("crop-frame");
  const cropImage = document.getElementById("crop-image");
  const cropZoom = document.getElementById("crop-zoom");
  const cropResLabel = document.getElementById("crop-res-label");
  const cropSetDefault = document.getElementById("crop-set-default");

  const MAX_OUTPUT_DIM = 2560;

  let cropState = null; // { naturalW, naturalH, coverScale, scale, tx, ty, frameW, frameH, targetW, targetH }

  function parseRes(resKey) {
    const [w, h] = resKey.split("x").map(Number);
    return { w: w || 1920, h: h || 1080 };
  }

  function openCropModal(file) {
    const { w: targetW, h: targetH } = parseRes(RES_KEY);
    cropResLabel.textContent = RES_KEY;
    document.documentElement.style.setProperty("--crop-ratio", `${targetW}/${targetH}`);
    cropSetDefault.checked = false;
    cropZoom.value = 100;

    const reader = new FileReader();
    reader.onload = () => {
      cropImage.src = reader.result;
      cropImage.onload = () => {
        // Bir sonraki frame'de frame boyutu doğru ölçülsün diye
        requestAnimationFrame(() => {
          const frameW = cropFrame.clientWidth;
          const frameH = cropFrame.clientHeight;
          const naturalW = cropImage.naturalWidth;
          const naturalH = cropImage.naturalHeight;
          const coverScale = Math.max(frameW / naturalW, frameH / naturalH);
          cropState = {
            naturalW, naturalH, coverScale,
            scale: coverScale,
            tx: (frameW - naturalW * coverScale) / 2,
            ty: (frameH - naturalH * coverScale) / 2,
            frameW, frameH, targetW, targetH,
          };
          renderCropTransform();
        });
      };
    };
    reader.readAsDataURL(file);
    cropModal.classList.remove("hidden");
  }

  function renderCropTransform() {
    if (!cropState) return;
    cropImage.style.transform = `translate(${cropState.tx}px, ${cropState.ty}px) scale(${cropState.scale})`;
  }

  function clampCropPosition() {
    const { naturalW, naturalH, scale, frameW, frameH } = cropState;
    const dispW = naturalW * scale;
    const dispH = naturalH * scale;
    const minTx = Math.min(0, frameW - dispW);
    const minTy = Math.min(0, frameH - dispH);
    cropState.tx = Math.max(minTx, Math.min(0, cropState.tx));
    cropState.ty = Math.max(minTy, Math.min(0, cropState.ty));
  }

  cropZoom.addEventListener("input", () => {
    if (!cropState) return;
    const factor = Number(cropZoom.value) / 100;
    const oldScale = cropState.scale;
    const newScale = cropState.coverScale * factor;
    // Merkezi sabit tutarak yakınlaştır
    const cx = cropState.frameW / 2;
    const cy = cropState.frameH / 2;
    const ratio = newScale / oldScale;
    cropState.tx = cx - (cx - cropState.tx) * ratio;
    cropState.ty = cy - (cy - cropState.ty) * ratio;
    cropState.scale = newScale;
    clampCropPosition();
    renderCropTransform();
  });

  let dragging = false;
  let dragStart = { x: 0, y: 0, tx: 0, ty: 0 };

  cropFrame.addEventListener("pointerdown", (e) => {
    if (!cropState) return;
    dragging = true;
    cropFrame.classList.add("grabbing");
    cropFrame.setPointerCapture(e.pointerId);
    dragStart = { x: e.clientX, y: e.clientY, tx: cropState.tx, ty: cropState.ty };
  });
  cropFrame.addEventListener("pointermove", (e) => {
    if (!dragging || !cropState) return;
    cropState.tx = dragStart.tx + (e.clientX - dragStart.x);
    cropState.ty = dragStart.ty + (e.clientY - dragStart.y);
    clampCropPosition();
    renderCropTransform();
  });
  function endDrag() {
    dragging = false;
    cropFrame.classList.remove("grabbing");
  }
  cropFrame.addEventListener("pointerup", endDrag);
  cropFrame.addEventListener("pointercancel", endDrag);

  document.getElementById("crop-reset").addEventListener("click", () => {
    if (!cropState) return;
    cropZoom.value = 100;
    cropState.scale = cropState.coverScale;
    cropState.tx = (cropState.frameW - cropState.naturalW * cropState.scale) / 2;
    cropState.ty = (cropState.frameH - cropState.naturalH * cropState.scale) / 2;
    renderCropTransform();
  });

  document.getElementById("crop-cancel").addEventListener("click", () => {
    cropModal.classList.add("hidden");
    cropState = null;
    cropImage.src = "";
  });
  cropModal.addEventListener("click", (e) => {
    if (e.target === cropModal) {
      cropModal.classList.add("hidden");
      cropState = null;
      cropImage.src = "";
    }
  });

  document.getElementById("crop-save").addEventListener("click", async () => {
    if (!cropState) return;
    const { naturalW, naturalH, scale, tx, ty, frameW, frameH, targetW, targetH } = cropState;

    const srcX = -tx / scale;
    const srcY = -ty / scale;
    const srcW = frameW / scale;
    const srcH = frameH / scale;

    let outW = targetW;
    let outH = targetH;
    if (Math.max(outW, outH) > MAX_OUTPUT_DIM) {
      const ratio = MAX_OUTPUT_DIM / Math.max(outW, outH);
      outW = Math.round(outW * ratio);
      outH = Math.round(outH * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(cropImage, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);

    const map = await migrateWallpapers();
    if (!map[RES_KEY]) map[RES_KEY] = [];
    map[RES_KEY].push(dataUrl);
    if (cropSetDefault.checked) {
      if (!map["default"]) map["default"] = [];
      map["default"].push(dataUrl);
    }
    await setStorage({ wallpapers: map });

    cropModal.classList.add("hidden");
    cropState = null;
    cropImage.src = "";
    document.getElementById("bg-upload").value = "";

    await applyBackground();
    await renderBgList();
  });

  document.getElementById("bg-upload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    openCropModal(file);
    e.target.value = "";
  });

  const dropzone = document.getElementById("bg-dropzone");
  ["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("drag-active");
    });
  });
  ["dragleave", "dragend"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("drag-active");
    });
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("drag-active");
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      openCropModal(file);
    }
  });

  async function renderBgList() {
    const map = await migrateWallpapers();
    const list = document.getElementById("bg-list");
    list.innerHTML = "";

    const keys = Object.keys(map).filter((k) => map[k] && map[k].length > 0);
    if (keys.length === 0) {
      list.innerHTML = `<p class="hint">${t("noBackground")}</p>`;
      return;
    }

    keys.forEach((res) => {
      const group = document.createElement("div");
      group.className = "bg-group";
      const title = document.createElement("div");
      title.className = "bg-group-title";
      title.innerHTML = `<b>${res === "default" ? t("defaultBg") : res}</b>${res === RES_KEY ? " — " + t("currentScreen") : ""} (${map[res].length} ${t("photoCount")})`;
      group.appendChild(title);

      const thumbs = document.createElement("div");
      thumbs.className = "bg-thumbs";
      map[res].forEach((dataUrl, idx) => {
        const thumb = document.createElement("div");
        thumb.className = "bg-thumb";
        thumb.innerHTML = `<img src="${dataUrl}"><button class="bg-remove" title="${t("remove")}">✕</button>`;
        thumb.querySelector(".bg-remove").addEventListener("click", async () => {
          map[res].splice(idx, 1);
          if (map[res].length === 0) delete map[res];
          await setStorage({ wallpapers: map });
          await applyBackground();
          await renderBgList();
        });
        thumbs.appendChild(thumb);
      });
      group.appendChild(thumbs);
      list.appendChild(group);
    });
  }

  // ---------------------------------------------------------------
  // Ayarlar modalı - sekmeler
  // ---------------------------------------------------------------
  const settingsModal = document.getElementById("settings-modal");
  document.getElementById("current-res").textContent = RES_KEY;

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add("active");
    });
  });

  function fillSettingsForm() {
    document.getElementById("opt-clock-enabled").checked = settings.clockEnabled;
    document.getElementById("opt-clock-format").value = settings.clockFormat;
    document.getElementById("opt-language").value = settings.language;
    document.getElementById("opt-date-enabled").checked = settings.dateEnabled;
    document.getElementById("opt-greeting-enabled").checked = settings.greetingEnabled;
    document.getElementById("opt-greeting-name").value = settings.greetingName;
    document.getElementById("opt-brand-enabled").checked = settings.brandEnabled;
    document.getElementById("opt-brand-text").value = settings.brandText;
    document.getElementById("opt-search-enabled").checked = settings.searchEnabled;
    document.getElementById("opt-search-engine").value = settings.searchEngine;
    document.getElementById("opt-search-autofocus").checked = settings.searchAutoFocus;
    document.getElementById("opt-tiles-newtab").checked = settings.tilesOpenNewTab;
    document.getElementById("opt-credit-enabled").checked = settings.creditEnabled;
    document.getElementById("opt-show-addtile").checked = settings.showAddTile !== false;
    document.getElementById("opt-suggestions").checked = settings.showSuggestions !== false;
    document.getElementById("opt-settings-btn").checked = settings.showSettingsBtn !== false;
    document.getElementById("opt-max-suggestions").value = Number(settings.maxSuggestions) || 16;
    const maxSugVal = document.getElementById("opt-max-suggestions-val");
    if (maxSugVal) maxSugVal.textContent = String(Number(settings.maxSuggestions) || 16);
    document.getElementById("opt-news").checked = settings.showNews !== false;
    populateNewsSourceOptions();
    document.getElementById("opt-news-custom-url").value = settings.customNewsUrl || "";

    document.getElementById("opt-overlay-opacity").value = settings.overlayOpacity;
    document.getElementById("opt-glass-blur").value = settings.glassBlur;
    document.getElementById("opt-accent-custom").value = settings.accentColor;
    document.getElementById("opt-slideshow-mode").value = settings.slideshowMode;
    document.getElementById("opt-bg-blur").value = settings.bgBlur;

    document.querySelectorAll("#opt-tile-size button").forEach((b) => {
      b.classList.toggle("active", b.dataset.value === settings.tileSize);
    });
    document.querySelectorAll(".swatch").forEach((s) => {
      s.classList.toggle("active", s.dataset.color.toLowerCase() === settings.accentColor.toLowerCase());
    });

    toggleDependentRows();
  }

  function toggleDependentRows() {
    document.getElementById("row-clock-format").style.display = settings.clockEnabled ? "" : "none";
    document.getElementById("row-greeting-name").style.display = settings.greetingEnabled ? "" : "none";
    document.getElementById("row-brand-text").style.display = settings.brandEnabled ? "" : "none";
    document.getElementById("row-search-engine").style.display = settings.searchEnabled ? "" : "none";
    document.getElementById("row-search-autofocus").style.display = settings.searchEnabled ? "" : "none";
  }

  function buildColorSwatches() {
    const wrap = document.getElementById("color-swatches");
    wrap.innerHTML = "";
    ACCENT_PRESETS.forEach((color) => {
      const sw = document.createElement("div");
      sw.className = "swatch";
      sw.style.background = color;
      sw.dataset.color = color;
      sw.addEventListener("click", async () => {
        settings.accentColor = color;
        await saveSettings();
        applySettings();
        fillSettingsForm();
      });
      wrap.appendChild(sw);
    });
  }
  buildColorSwatches();

  document.getElementById("opt-accent-custom").addEventListener("input", async (e) => {
    settings.accentColor = e.target.value;
    await saveSettings();
    applySettings();
    document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
  });

  document.querySelectorAll("#opt-tile-size button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      settings.tileSize = btn.dataset.value;
      await saveSettings();
      applySettings();
      fillSettingsForm();
    });
  });

  function bindToggle(id, key, onAfter) {
    document.getElementById(id).addEventListener("change", async (e) => {
      settings[key] = e.target.checked;
      await saveSettings();
      applySettings();
      toggleDependentRows();
      if (onAfter) onAfter();
    });
  }
  bindToggle("opt-clock-enabled", "clockEnabled");
  bindToggle("opt-date-enabled", "dateEnabled");
  bindToggle("opt-greeting-enabled", "greetingEnabled");
  bindToggle("opt-brand-enabled", "brandEnabled");
  bindToggle("opt-search-enabled", "searchEnabled");
  bindToggle("opt-search-autofocus", "searchAutoFocus");
  bindToggle("opt-tiles-newtab", "tilesOpenNewTab");
  bindToggle("opt-credit-enabled", "creditEnabled");
  bindToggle("opt-show-addtile", "showAddTile", () => renderTiles());
  bindToggle("opt-suggestions", "showSuggestions", () => renderTiles());
  bindToggle("opt-settings-btn", "showSettingsBtn", () => applySettings());

  function bindSelect(id, key, onAfter) {
    document.getElementById(id).addEventListener("change", async (e) => {
      settings[key] = e.target.value;
      await saveSettings();
      applySettings();
      if (onAfter) onAfter();
    });
  }
  bindSelect("opt-clock-format", "clockFormat", tickClock);
  bindSelect("opt-search-engine", "searchEngine");
  bindSelect("opt-slideshow-mode", "slideshowMode");
  bindSelect("opt-language", "language", applyLanguage);

  function bindTextInput(id, key, onAfter) {
    document.getElementById(id).addEventListener("input", async (e) => {
      settings[key] = e.target.value;
      await saveSettings();
      applySettings();
      if (onAfter) onAfter();
    });
  }
  bindTextInput("opt-greeting-name", "greetingName");
  bindTextInput("opt-brand-text", "brandText");
  bindTextInput("opt-news-custom-url", "customNewsUrl");
  document.getElementById("opt-news-custom-url").addEventListener("change", () => renderNews(true));

  function bindSlider(id, key, onAfter) {
    const valEl = document.getElementById(id + "-val");
    document.getElementById(id).addEventListener("input", async (e) => {
      settings[key] = Number(e.target.value);
      if (valEl) valEl.textContent = e.target.value;
      await saveSettings();
      applySettings();
      if (onAfter) onAfter();
    });
  }
  bindSlider("opt-overlay-opacity", "overlayOpacity");
  bindSlider("opt-glass-blur", "glassBlur");
  bindSlider("opt-bg-blur", "bgBlur");
  bindSlider("opt-max-suggestions", "maxSuggestions", () => renderTiles());
  bindToggle("opt-news", "showNews", () => renderTiles());
  bindSelect("opt-news-source", "newsSource", () => { updateNewsCustomRow(); renderNews(true); });

  let settingsBtnEl = document.getElementById("settings-btn");
  let settingsHotspotEl = document.getElementById("settings-hotspot");

  async function openSettings() {
    fillSettingsForm();
    await renderBgList();
    settingsModal.classList.remove("hidden");
  }

  settingsBtnEl.addEventListener("click", () => openSettings());
  // Buton gizliyken: fare sağ kenara/butona gelince buton kayar, çekilince geri gizlenir
  let unpeekTimer = null;
  function peekSettings() {
    if (!settingsBtnEl.classList.contains("edge-hidden")) return;
    clearTimeout(unpeekTimer);
    settingsBtnEl.classList.add("peeked");
  }
  function unpeekSettingsSoon(delay) {
    clearTimeout(unpeekTimer);
    unpeekTimer = setTimeout(() => settingsBtnEl.classList.remove("peeked"), delay);
  }
  settingsHotspotEl.addEventListener("mouseenter", peekSettings);
  settingsHotspotEl.addEventListener("mouseleave", () => unpeekSettingsSoon(450));
  settingsBtnEl.addEventListener("mouseenter", peekSettings);
  settingsBtnEl.addEventListener("mouseleave", () => unpeekSettingsSoon(350));
  document.getElementById("settings-close").addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.classList.add("hidden");
  });

  // ---------------------------------------------------------------
  // Yedekleme: dışa aktar / içe aktar / sıfırla
  // ---------------------------------------------------------------
  document.getElementById("btn-export").addEventListener("click", async () => {
    const all = await getStorage(null);
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `gx-speed-dial-${t("exportName")}-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("btn-import").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (typeof data !== "object" || data === null) throw new Error("geçersiz dosya");
        await setStorage(data);
        window.location.reload();
      } catch (err) {
        alert(t("importErr"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("btn-clear-shortcuts").addEventListener("click", async () => {
    if (!confirm(t("clearConfirm"))) return;
    shortcuts = [];
    await saveShortcuts();
    renderTiles();
  });

  document.getElementById("btn-reset-all").addEventListener("click", async () => {
    if (!confirm(t("resetConfirm"))) return;
    await new Promise((resolve) => chrome.storage.local.clear(resolve));
    window.location.reload();
  });

  // ---------------------------------------------------------------
  // Başlat
  // ---------------------------------------------------------------
  (async function init() {
    await loadSettings();
    applySettings();
    applyLanguage();
    if (settings.searchAutoFocus) input.focus();
    await applyBackground();
    await loadShortcuts();
  })();
})();
