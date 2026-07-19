importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// Firebase configuration - these are public values, safe to hardcode
firebase.initializeApp({
  apiKey:            'AIzaSyDW0ad5EKVx7BEgT8AKyDViTPfapwL4pd4',
  authDomain:        'ownzo-68cc6.firebaseapp.com',
  projectId:         'ownzo-68cc6',
  storageBucket:     'ownzo-68cc6.firebasestorage.app',
  messagingSenderId: '97690045585',
  appId:             '1:97690045585:web:f0ccccc8e4519db9c48330',
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
