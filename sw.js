// Everyday hustle · garde l'app sur le téléphone pour qu'elle s'ouvre sans réseau
const CACHE="hustle-4f-2026-10-29-1";
const ASSETS=["./", "./index.html", "./manifest.webmanifest", "./icon.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET"||new URL(req.url).origin!==location.origin)return;
  // page : copie locale tout de suite, mise à jour en arrière-plan quand le réseau est là
  if(req.mode==="navigate"){
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match("./index.html");
      const net=fetch(req).then(r=>{if(r&&r.ok)c.put("./index.html",r.clone());return r}).catch(()=>null);
      return hit||(await net)||new Response("Hors ligne",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
    }));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{
    if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
    return r;
  })));
});
