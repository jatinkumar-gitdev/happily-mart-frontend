self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || data.message,
      icon: "/logo192.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
        ...data,
      },
      actions: data.actions || [
        { action: "view", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
      tag: data.tag || "notification",
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Happily Mart", options)
    );
  } catch (error) {
    console.error("Push notification error:", error);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener("pushsubscriptionchange", function (event) {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        return fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
          credentials: "include",
        });
      })
  );
});
