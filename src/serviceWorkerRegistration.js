// src/serviceWorkerRegistration.js - Production-ready Service Worker Registration
const isLocalhost = Boolean(window.location.hostname === "localhost" || window.location.hostname === "[::1]" || window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));

export function register(config) {
	if ("serviceWorker" in navigator) {
		const publicUrl = new URL(process.env.PUBLIC_URL || "", window.location.href);
		if (publicUrl.origin !== window.location.origin) {
			// Service worker won't work if PUBLIC_URL is on a different origin
			return;
		}

		window.addEventListener("load", () => {
			const swUrl = `${process.env.PUBLIC_URL || ""}/sw.js`;

			if (isLocalhost) {
				// Running on localhost - verify if a service worker still exists or not
				checkValidServiceWorker(swUrl, config);
				navigator.serviceWorker.ready.then(() => {
					console.log("[PWA] App is being served cache-first by a service worker.");
				});
			} else {
				// Production environment
				registerValidSW(swUrl, config);
			}
		});
	}
}

function registerValidSW(swUrl, config) {
	navigator.serviceWorker
		.register(swUrl, { scope: "/" })
		.then((registration) => {
			console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);

			registration.onupdatefound = () => {
				const installingWorker = registration.installing;
				if (installingWorker == null) return;

				installingWorker.onstatechange = () => {
					if (installingWorker.state === "installed") {
						if (navigator.serviceWorker.controller) {
							// New content is available; please refresh.
							console.log("[PWA] New content is available and will be used when all tabs are closed.");
							if (config?.onUpdate) {
								config.onUpdate(registration);
							}
						} else {
							// Content is cached for offline use.
							console.log("[PWA] Content is cached for offline use.");
							if (config?.onSuccess) {
								config.onSuccess(registration);
							}
						}
					}
				};
			};
		})
		.catch((error) => {
			console.error("[PWA] Error during service worker registration:", error);
		});
}

function checkValidServiceWorker(swUrl, config) {
	// Check if the service worker can be found. If it can't reload the page.
	fetch(swUrl, {
		headers: { "Service-Worker": "script" },
	})
		.then((response) => {
			// Ensure service worker exists, and that we really are getting a JS file.
			const contentType = response.headers.get("content-type");
			if (response.status === 404 || (contentType != null && contentType.indexOf("javascript") === -1)) {
				// No service worker found. Probably a different app. Reload the page.
				navigator.serviceWorker.ready.then((registration) => {
					registration.unregister().then(() => {
						window.location.reload();
					});
				});
			} else {
				// Service worker found. Proceed as normal.
				registerValidSW(swUrl, config);
			}
		})
		.catch(() => {
			console.log("[PWA] No internet connection found. App is running in offline mode.");
		});
}

export function unregister() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.ready
			.then((registration) => {
				registration.unregister();
			})
			.catch((error) => {
				console.error("[PWA] Error unregistering service worker:", error);
			});
	}
}
