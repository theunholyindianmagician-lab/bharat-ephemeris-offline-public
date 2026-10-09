const CACHE = "bharat-ephemeris-s9-v27-kerala";   // v27: the fourth choice (Kerala paramparā) and Parameśvara's ayanāṃśa in the default; v26: the eclipse-contact fix; the referee theories are not precached
const CORE = [
  "./",
  "./index.html",
  "./museum.html",
  "./library.html",
  "./panchang.html",
  "./shunyabheda.html",
  "./shoonya_sovereign_dashboard.html",
  "./math-core.js",
  "./siddhanta-drik.js",
  "./siddhanta-tier.js",
  "./payment.js",
  "./shunyabheda-app.js",
  "./global.css",
  "./global-ui.js",
  "./live-board.js",
  "./page-live.js",
  "./field-gl.js",
  "./access-enhance.js",
  "./icon.svg",
  "./og/dashboard.png",
  "./og/index.png",
  "./og/museum.png",
  "./og/panchang.png",
  "./og/shunyabheda.png",
  "./manifest.webmanifest",
  "./og/library.png",
  "./og/siddhanta-panchanga.png",
  "./og/vedha.png",
  "./edition-nav-enhancer.js",
  // vedha.html, the observation companion, and the sovereign engine it runs on (offline)
  "./vedha.html", "./vedha-page.js",
  "./katapayadi.js", "./kala-dvara.js", "./sphuta.js", "./dhruva.js", "./ss-udaya.js", "./spanda-ganita.js", "./ss-chaya.js",
  "./ss-grahana.js", "./panchanga.js", "./utsava.js", "./ss-drishya.js", "./yantra.js", "./vedha-lekha.js",
  "./corpus/surya-siddhanta/yogatara.json",
  // siddhanta-panchanga.html, the public pañcāṅga on the same engine (with muhurta.js and dasha.js)
  "./siddhanta-panchanga.html", "./siddhanta-panchanga-page.js", "./muhurta.js", "./dasha.js",
  // ganita-shala.html, the research page: every derivation with its measured figure, and the four choices against the sky
  "./ganita-shala.html", "./ganita-shala-page.js", "./sukshma-kala.js", "./corpus/research/derivations.json", "./corpus/research/parampara-apply.json",
  // the three tiers (2026-10-08): every page that loads math-core.js loads the text tiers' modules, the paramparā record
  // (parampara-record.js = corpus/parampara/registry.json + samskara.json as one script; the JSON files too, for a page
  // that reads them), ss-tier.js, and for the Modern Bhāratīya (dṛk) choice siddhanta-tier.js and drik-grahana.js;
  // samskara.js and parahita-madhyama.js serve the saṃskāra tier's eclipses (ss-tier.js eclipsesNear)
  "./ss-graha.js", "./ss-ahargana.js", "./parampara.js", "./parampara-record.js", "./ss-tier.js", "./drik-grahana.js",
  "./corpus/parampara/registry.json", "./corpus/parampara/samskara.json", "./samskara.js", "./parahita-madhyama.js"
];

// Library downloads (offline-complete after the lazy warm-up, like the editions): every file library.html links —
// each book's notebook, dossier and dataset, and the four collector bundles (about 3.6 MB in all)
const DOWNLOADS = [
  "./downloads/Surya_Siddhanta_Rahasya_Complete_Suite.ipynb", "./downloads/Surya_Siddhanta_Rahasya_Sovereign_Dossier.md", "./downloads/Surya_Siddhanta_Rahasya_Full_Dataset.json",
  "./downloads/Parashara_Rahasya_Complete_Suite.ipynb", "./downloads/Parashara_Rahasya_Sovereign_Dossier.md", "./downloads/Parashara_Rahasya_Full_Dataset.json",
  "./downloads/Paramanu_Bija_Ganita_Complete_Suite.ipynb", "./downloads/Paramanu_Bija_Ganita_Sovereign_Dossier.md", "./downloads/Paramanu_Bija_Ganita_Full_Dataset.json",
  "./downloads/Panini_Rahasya_Complete_Suite.ipynb", "./downloads/Panini_Rahasya_Sovereign_Dossier.md", "./downloads/Panini_Rahasya_Full_Dataset.json",
  "./downloads/Aryabhata_Complete_Suite.ipynb", "./downloads/Aryabhata_Sovereign_Dossier.md", "./downloads/Aryabhata_Full_Dataset.json",
  "./downloads/Brahmagupta_Complete_Suite.ipynb", "./downloads/Brahmagupta_Sovereign_Dossier.md", "./downloads/Brahmagupta_Full_Dataset.json",
  "./downloads/Bhaskara_Complete_Suite.ipynb", "./downloads/Bhaskara_Sovereign_Dossier.md", "./downloads/Bhaskara_Full_Dataset.json",
  "./downloads/Madhava_Complete_Suite.ipynb", "./downloads/Madhava_Sovereign_Dossier.md", "./downloads/Madhava_Full_Dataset.json",
  "./downloads/Pingala_Complete_Suite.ipynb", "./downloads/Pingala_Sovereign_Dossier.md", "./downloads/Pingala_Full_Dataset.json",
  "./downloads/Sulba_Complete_Suite.ipynb", "./downloads/Sulba_Sovereign_Dossier.md", "./downloads/Sulba_Full_Dataset.json",
  "./downloads/ShunyaQuantum_Complete_Suite.ipynb", "./downloads/ShunyaQuantum_Sovereign_Dossier.md", "./downloads/ShunyaQuantum_Full_Dataset.json",
  "./downloads/RasayanaDhatu_Complete_Suite.ipynb", "./downloads/RasayanaDhatu_Sovereign_Dossier.md", "./downloads/RasayanaDhatu_Full_Dataset.json",
  "./downloads/Complete_Tri_Grantha_Collector_Bundle.json", "./downloads/Complete_Quad_Grantha_Collector_Bundle.json",
  "./downloads/Complete_Deca_Grantha_Collector_Bundle.json", "./downloads/Complete_Dodeca_Grantha_Collector_Bundle.json"
];

const EDITIONS = [
  "./editions/aryabhata-full-edition.html",
  "./editions/bhaskara-full-edition.html",
  "./editions/brahmagupta-full-edition.html",
  "./editions/madhava-full-edition.html",
  "./editions/maha-grantha-full-edition.html",
  "./editions/panini-rahasya-full-edition.html",
  "./editions/parashara-rahasya-full-edition.html",
  "./editions/pingala-full-edition.html",
  "./editions/sulba-full-edition.html",
  "./editions/surya-siddhanta-full-edition.html"
];

// Bypass the HTTP cache when (re)filling the shell: a new SW version must install the
// files as they are on the server now, not whatever the browser cached under a max-age.
function freshRequest(url) {
  return new Request(url, { cache: "reload", credentials: "same-origin" });
}

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(CORE.map(freshRequest));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
  // Lazy warm-up of the library editions (~19MB) — deliberately NOT inside
  // waitUntil: fetch events must not wait behind this download.
  caches.open(CACHE).then(function (cache) {
    return Promise.all(EDITIONS.concat(DOWNLOADS).map(function (path) {
      return cache.add(path).catch(function () {});
    }));
  });
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const live = /\.(js|css|html|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (live) {
    // Network-first must really hit the network: "no-cache" revalidates against the server
    // (a 304 when unchanged) instead of trusting a heuristically-fresh HTTP-cache copy, so a
    // page and its ?v= scripts can never come from two different releases.
    const netReq = req.mode === "navigate"
      ? new Request(req.url, { cache: "no-cache", credentials: "same-origin" })
      : new Request(req, { cache: "no-cache" });
    event.respondWith(fetch(netReq).then(function (res) {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || new Response("offline · not cached", { status: 503, statusText: "Offline" });
      });
    }));
    return;
  }
  event.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(req);
  }));
});
