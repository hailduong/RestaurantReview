const staticCacheName = "myCache-1";

const worker = self;

self.addEventListener('install', (event) => {
	console.log('Install Service Worker');
	event.waitUntil(
		caches.open(staticCacheName).then((cache) => {
			return cache.addAll([
				"/",
				"/css/styles.css",
				"/img/1.jpg",
				"/img/2.jpg",
				"/img/3.jpg",
				"/img/4.jpg",
				"/img/5.jpg",
				"/img/6.jpg",
				"/img/7.jpg",
				"/img/8.jpg",
				"/img/9.jpg",
				"/img/10.jpg",
				"/data/restaurants.json",
				"/js/dbhelper.js",
				"/js/main.js",
				"/js/appController.js",
				"/js/restaurant_info.js",
				"/restaurant.html"
			])
		})
	)
});

self.addEventListener('fetch', (event) => {

	if (event.request.url.indexOf('https://maps.googleapis.com/maps/api/js') > -1) {
		fetch(event.request).catch((err) => {
			console.log('there is error fetching', event.request.url, err);
			self.clients.matchAll().then((clients) => {
				clients.forEach(client => {
					client.postMessage({action: "failedToFetchGoogleMap"})
				})
			})
		})

	} else {
		event.respondWith(
			caches.match(event.request, {ignoreSearch: true}).then((response) => {
				return response || fetch(event.request)
			})
		)
	}
});