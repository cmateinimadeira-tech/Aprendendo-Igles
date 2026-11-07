// Service worker: deixa o app funcionando offline.
// Arquivos do app: tenta a rede primeiro (para receber atualizações) e usa o
// cache quando estiver sem internet. Fontes do Google: cache primeiro.
const CACHE = "aprendendo-ingles-v12";
const APP = [
  "./", "./index.html", "./data.js", "./anpad.js", "./words.js", "./ngsl.js", "./reading/readings.js", "./reading.js", "./game.js", "./app.js", "./lessons/vocab-tags.js", "./lessons/links-a.js", "./lessons/links-b.js",
  "./lessons/level-1.js", "./lessons/level-2.js", "./lessons/level-2b.js", "./lessons/level-2c.js", "./lessons/level-3.js", "./lessons/level-3b.js", "./lessons/level-3c.js", "./lessons/level-4.js", "./lessons/level-5.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  // cache: "no-cache" confere com o servidor a cada abertura (o GitHub Pages
  // deixa os arquivos 10 minutos no cache do navegador, o que atrasava atualizações).
  e.respondWith(fetch(req, { cache: "no-cache" }).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html"))));
});
