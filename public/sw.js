/* eslint-disable no-restricted-globals */

const CACHE_NAME = "haushalt-v1"
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/NotoSans-Regular.ttf",
]
const GLB_PATTERN = /\.glb$/

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  // Cache-first for GLB files (large 3D assets)
  if (GLB_PATTERN.test(request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
        })
      )
    )
    return
  }
  // Network-first for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.method === "GET") {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})
