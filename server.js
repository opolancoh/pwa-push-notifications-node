var express = require('express');
var bodyParser = require('body-parser');
const webpush = require('web-push');
const path = require('path');

var app = express();

// Set static path
app.use(express.static(path.join(__dirname)));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// webpush config
const publicVapidKey =
  'BAlgUNN_QpwY41suNSSfiI-pTBctJE_aK6_IIJNGqTz5Yv72vJtIK03_OKK3sLDLBtIqyzR8jWfX8twBFC9FgO4';
const privateVapidKey = 'yrE70m3inCaBeRB4PeHvbpFoxwZK9ZI4yi5_8luBAew';
webpush.setVapidDetails(
  'mailto:test@test.com',
  publicVapidKey,
  privateVapidKey
);

let subscriptions = [];
let count = 1;

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/subscriptions', function(req, res) {
  res.status(201).json({ length: subscriptions.length, subscriptions });
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  console.log('\nNew subscription request:\n', subscription);

  subscriptions.push(subscription);

  const notificationPayload = JSON.stringify({
    title: 'Subscription successful!',
    options: { body: 'A push notification was received!!' }
  });

  // Send notification to subscribed client
  webpush
    .sendNotification(subscription, notificationPayload)
    .catch(err => console.error(err));

  res.status(201).json({});
});

app.post('/notify', (req, res) => {
  const notificationPayload = JSON.stringify({
    title: 'Notification #' + count++,
    options: { body: 'A push notification was received!!' }
  });

  subscriptions.forEach(item => {
    webpush
      .sendNotification(item, notificationPayload)
      .catch(err => console.error('[Exception][/notify]', err));
  });

  res.status(201).json({});
});

const port = process.env.PORT || 5000;
const now = new Date();

app.listen(port, () => {
  console.log(`Server started on port ${port} at ${now} ...`);
  console.log(`\nNode version: ${process.version}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
});
