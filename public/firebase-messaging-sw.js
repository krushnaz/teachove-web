/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDRQnSs5QmvNrfEDE2GIwyfas3SkDFZyn4',
  authDomain: 'schoolapp-20eb1.firebaseapp.com',
  projectId: 'schoolapp-20eb1',
  storageBucket: 'schoolapp-20eb1.firebasestorage.app',
  messagingSenderId: '716866888427',
  appId: '1:716866888427:web:322c3fffbd31976df7d4ae',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Teachove';
  const options = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon.png',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = '/master-admin/get-in-touch';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/master-admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
