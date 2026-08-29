// Opera GX'in "yeni sekme" için kullandığı iç sayfa "chrome://startpage/"
// (bazı sürümlerde "opera://startpage/" olarak da görünebiliyor).
const START_PREFIXES = [
  "chrome://startpage",
  "opera://startpage",
  "opera://newtab",
  "chrome://newtab"
];

function isStartPage(url) {
  if (!url) return false;
  return START_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function redirectIfStartpage(tabId, url) {
  if (isStartPage(url)) {
    chrome.tabs.update(tabId, { url: chrome.runtime.getURL("newtab.html") });
  }
}

chrome.tabs.onCreated.addListener((tab) => {
  redirectIfStartpage(tab.id, tab.url || tab.pendingUrl);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  redirectIfStartpage(tabId, changeInfo.url || tab.url);
});

// ---- Ağ köprüsü (CORS düzeltmesi) ----
// newtab.html sayfasından yapılan dış istekler CORS'a takılabiliyor.
// host_permissions service worker için de geçerli olduğu için haber/RSS
// isteklerini buradan geçiriyoruz: "FETCH_URL" mesajı -> { ok, status, text }.


chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "FETCH_URL") return;
  const url = typeof msg.url === "string" ? msg.url : "";
  if (!/^https?:\/\//i.test(url)) {
    sendResponse({ ok: false, status: 0, error: "Gecersiz URL" });
    return;
  }
  fetch(url, { redirect: "follow" })
    .then(async (res) => {
      let text = "";
      try { text = await res.text(); } catch {}
      sendResponse({ ok: res.ok, status: res.status, text });
    })
    .catch((err) => {
      sendResponse({ ok: false, status: 0, error: String((err && err.message) || err) });
    });
  return true; // sendResponse asenkron çağrılacak; mesaj kanalını açık tut
});
