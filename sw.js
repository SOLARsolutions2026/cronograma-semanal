/* Service worker: la app funciona sin conexión. Cambia VERSION al publicar cambios. */
const VERSION='cronograma-v1';
const ARCHIVOS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const url=new URL(r.url);
  if(url.origin===location.origin){
    /* Red primero para la página (recibe actualizaciones); caché si no hay conexión */
    if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(ca=>ca.put('index.html',c));return res}).catch(()=>caches.match('index.html')));return}
    e.respondWith(caches.match(r).then(m=>m||fetch(r)));return;
  }
  if(url.host==='fonts.googleapis.com'||url.host==='fonts.gstatic.com'){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(ca=>ca.put(r,c));return res})));
  }
});
