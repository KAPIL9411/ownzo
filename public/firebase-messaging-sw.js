importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            self.FIREBASE_API_KEY            || '',
  authDomain:        self.FIREBASE_AUTH_DOMAIN        || '',
  projectId:         self.FIREBASE_PROJECT_ID         || '',
  storageBucket:     self.FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID|| '',
  appId:             self.FIREBASE_APP_ID             || '',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body, icon } = payload.notification ?? {};

  self.registration.showNotification(title ?? 'Ownzo', {
    body:  body  ?? 'You have a new notification',
    icon:  icon  ?? '/images/logo/logo.webp',
    badge: '/images/logo/logo.webp',
    data:  payload.data,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
