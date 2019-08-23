const publicVapidKey =
  'BAlgUNN_QpwY41suNSSfiI-pTBctJE_aK6_IIJNGqTz5Yv72vJtIK03_OKK3sLDLBtIqyzR8jWfX8twBFC9FgO4';
const processingMsg = 'Processing ...';

try {
  const now = new Date();

  document.getElementById('appMessage').innerHTML =
    'Checking for PWA features at ' + now + '...';

  window.addEventListener('load', e => {
    if (!('serviceWorker' in navigator)) {
      document.getElementById('swSupported').innerHTML = 'No';
      return;
    }
    document.getElementById('swSupported').innerHTML = 'Yes';
    navigator.serviceWorker
      .register('service-worker.js')
      .then(function() {
        document.getElementById('swRegistered').innerHTML = 'Yes';
        if (checkPushManagerSupport() && checkNotificationPermission())
          checkPushManagerSubscription();
      })
      .catch(function(error) {
        console.log('Service Worker Registration failed:', error);
        document.getElementById('swRegistered').innerHTML = 'No';
      });
  });

  // Check for Push Manager
  function checkPushManagerSupport() {
    if (!('PushManager' in window)) {
      document.getElementById('pmSupported').innerHTML = 'No';
      return false;
    } else {
      document.getElementById('pmSupported').innerHTML = 'Yes';
      return true;
    }
  }

  // Check for notification permission
  function checkNotificationPermission() {
    document.getElementById('notificationPermission').innerHTML =
      Notification.permission;
    if (Notification.permission !== 'denied') return true;
    return false;
  }

  function checkPushManagerSubscription() {
    // Get push notification subscription
    navigator.serviceWorker.ready.then(function(registration) {
      registration.pushManager
        .getSubscription()
        .then(function(subscription) {
          if (subscription) {
            // User is currently subscribed to push
            const subscriptionId = subscription.endpoint.split('fcm/send/')[1];
            document.getElementById('pmSubscriptionStatus').innerHTML =
              'Subscribed! ID = "' + subscriptionId + '"';
          } else {
            // User is not currently subscribed to push
            document.getElementById('pmSubscriptionStatus').innerHTML =
              'No subscription was found';

            document.getElementById('pm-subscribe').style.display = '';
          }
        })
        .catch(function(error) {
          console.error('Error occurred enabling push ', error);
        });
    });
  }
} catch (e) {
  document.getElementById('appMessage').innerHTML = '[Exception] ' + e;
}

async function onSubscribeToPushNotifications() {
  try {
    const subscription = await subscribeToPushNotifications();

    if (subscription) {
      const wasSent = await sendSubscriptionToServer(subscription);

      if (wasSent) document.getElementById('push-ready').innerHTML = 'Yes';
      else document.getElementById('push-ready').innerHTML = 'No';
    }
  } catch (err) {
    logException('onSubscribeToPushNotifications()', err);
  }
}

async function subscribeToPushNotifications() {
  try {
    document.getElementById('subscribing-status').innerHTML = processingMsg;
    const registration = await navigator.serviceWorker.ready;

    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    };

    const subscription = await registration.pushManager.subscribe(
      subscribeOptions
    );

    const subscriptionId = subscription.endpoint.split('fcm/send/')[1];
    document.getElementById('subscribing-status').innerHTML =
      'Subscribed! ID = "' + subscriptionId + '"';

    return subscription;
  } catch (err) {
    logException('subscribeToPushNotifications()', err);
    document.getElementById('subscribing-status').innerHTML = 'Error!';
    return null;
  }
}

async function sendSubscriptionToServer(subscription) {
  try {
    document.getElementById('send-to-server').innerHTML = processingMsg;
    await fetch('/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription), // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json'
      }
    });
    document.getElementById('send-to-server').innerHTML = 'Yes';
    return true;
  } catch (err) {
    logException('sendSubscriptionToServer()', err);
    document.getElementById('send-to-server').innerHTML = 'Error!';
    return null;
  }

  /*var subscriptionId = subscription.endpoint.split('fcm/send/')[1];
  console.log('Subscription ID', subscriptionId);
  fetch('http://localhost:8080/subscribers', {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ subscriptionId })
  });*/
}

function logException(sender, error) {
  const msg = `[Exception][${sender}] ${error}`;
  console.error(msg);
  document.getElementById('appMessage').innerHTML = msg;
}

function addSubscriptionElement() {}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
