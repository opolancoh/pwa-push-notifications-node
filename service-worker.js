self.addEventListener('push', function(event) {
  console.log('Push Received ...');
  const data = event.data.json();
  console.log(data);

  const title = data.title;
  const options = data.options;
  options.icon = './images/icons/icon-72x72.png';

  event.waitUntil(self.registration.showNotification(title, options));
});
