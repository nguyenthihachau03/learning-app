self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return; // Chỉ xử lý các request GET
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open('dynamic-cache').then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      return new Response("⚠ Không thể tải nội dung. Kiểm tra kết nối mạng!", { status: 408 });
    })
  );
});
