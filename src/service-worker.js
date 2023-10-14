/// <reference types="@sveltejs/kit" />
import { build, files, version } from "$service-worker";

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files, // everything in `static`
];

self.addEventListener("install", (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

self.addEventListener("activate", (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event) => {
  // ignore POST requests etc
  if (event.request.method !== "GET") return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      return cache.match(url.pathname);
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      return cache.match(event.request);
    }
  }
  event.respondWith(respond());
});

self.addEventListener("push", (e) => {
  const channel = new BroadcastChannel("sw-messages");

  if (e.data) {
    const notification = e.data.json();
    console.log({ notification });
    if (notification.type === "decline") {
      channel.postMessage({ type: notification.type });
    }
    if (notification.type === "call") {
      e.waitUntil(
        self.registration.showNotification(notification.peerId, {
          icon: "favicon-128x128.png",
          vibrate: [200, 100, 300],
          requireInteraction: true,
          userVisibleOnly: true,
          data: {
            id: notification.id,
          },
          tag: notification.peerId,
          sound: "/ring.mp3",
          actions: [
            {
              action: `answer`,
              title: "Answer",
              type: "button",
              icon: "/answer.svg",
            },
            {
              action: "decline",
              title: "Decline",
              type: "button",
              icon: "/decline.svg",
            },
          ],
        })
      );
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  if (!event.action) {
    console.log("Notification Click.");
    return;
  }
  const { notification } = event;
  const sendNotification = async () => {
    try {
      const response = await fetch("/sendNotification", {
        method: "POST",
        body: JSON.stringify({
          id: notification.tag,
          payload: {
            id: notification.data.id,
            peerId: notification.tag,
            type: "decline",
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      console.log("decline notification sent");
    } catch (error) {
      console.error(error);
    }
  };
  switch (event.action) {
    case "answer":
      event.notification.close();
      const origin = self.location.origin;
      const path = `${origin}?answer=${notification.tag}`;
      event.waitUntil(clients.openWindow(path));
      break;
    case "decline": {
      event.notification.close();
      event.waitUntil(sendNotification());
      break;
    }
    default:
      console.log(`Unknown action clicked: '${event.action}'`);
      break;
  }
});
