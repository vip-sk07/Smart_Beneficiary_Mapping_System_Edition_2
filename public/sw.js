self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      data: {
        url: data.url || '/'
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});

// Offline-First Sync using Native IndexedDB API
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-applications') {
    event.waitUntil(processBackgroundSync());
  }
});

async function processBackgroundSync() {
  const db = await openDatabase();
  const tx = db.transaction('offline-applications', 'readwrite');
  const store = tx.objectStore('offline-applications');
  const applications = await getAllFromStore(store);

  if (applications.length === 0) return;

  for (const app of applications) {
    if (app.status === 'pending') {
      try {
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schemeId: app.schemeId }),
        });

        if (response.ok) {
          // Success, delete it from the store
          await deleteFromStore(db, app.id);
          self.registration.showNotification("Offline Application Synced", {
             body: `Successfully applied to ${app.schemeTitle || "scheme"} now that you're back online!`,
             icon: "/icon-192.png"
          });
        } else {
          // Leave it in store, or mark as failed
          console.error("BG Sync Failed with status:", response.status);
          await markStoreFailed(db, app);
        }
      } catch (err) {
        console.error("BG Sync fetch network error. Will retry later.", err);
        throw err; // By throwing, Background Sync will naturally retry later if it was network issue
      }
    }
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sbms-offline-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    // Don't need onupgradeneeded here because it's guaranteed to be created by the client first
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function deleteFromStore(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline-applications', 'readwrite');
    const store = tx.objectStore('offline-applications');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function markStoreFailed(db, app) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline-applications', 'readwrite');
    const store = tx.objectStore('offline-applications');
    app.status = 'failed';
    const req = store.put(app);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
