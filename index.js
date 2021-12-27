const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { appendSubscription, sendNotification, getSubscriptionsFromFile } = require('./helpers');
require('dotenv').config();

const app = express();

app.use(cors());
const jsonParser = bodyParser.json();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const PORT = process.env.PORT || 5000;

app.post('/basket/purchase', async function (req, res) {
  console.log('PURCHASE');
  try {
    const payload = JSON.stringify({
      title: 'Successfully paid',
      content: 'The time slots succeefully provided',
      data: {
        openUrl: '/',
      },
    });

    await sendNotification(payload);
    res.json(payload);
  } catch (err) {
    console.log('SEND NOTIFICATION ERROR', err);
  }
});

app.post('/app/notify', jsonParser, async function (req, res) {
  console.log('NOTIFY');
  console.log('body', req.body);
  try {
    const { title, content, data } = req.body || {};

    const payload = JSON.stringify({
      title,
      content,
      data: data || null,
    });

    await sendNotification(payload);
    const subscriptions = await getSubscriptionsFromFile();
    res.json(subscriptions);
  } catch (err) {
    console.log('SEND NOTIFICATION ERROR', err);
  }
});

app.post('/app/register', jsonParser, async function (req, res) {
  try {
    await appendSubscription(req.body);
    res.json({});
  } catch (err) {
    console.log('REGISTER SUBSCRIPTION ERROR', err);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
