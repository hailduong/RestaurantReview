class AppController {
	constructor() {
		this.initServiceWorker();
	}

	initServiceWorker() {

		// Check if serviceWorker is available;
		if (!navigator.serviceWorker) return;

		// Register serviceWorker
		navigator.serviceWorker.register('/sw.js', {scope: "/"}).then((reg) => {
			console.log('Service Worker Registered')
			reg.addEventListener('message', (event) => {
				console.log(event)
			})
		}).catch((err) => {
			console.log('Failed to register a Service Worker', err)
		})
	}
}

new AppController();