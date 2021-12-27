const fsp = require('fs').promises;
const webpush = require('web-push');

const getSubscriptionsFromFile = async () => {
  try {
    const data = await fsp.readFile('subscriptions.json', 'utf8');
    const existingSubscriptions = data ? JSON.parse(data) : {};
    return existingSubscriptions;
  } catch (err) {
    console.log('READ SUBSCRIPTIONS FILE ERROR', err);
    return null;
  }
};

const appendSubscription = async subscription => {
  if (!subscription) return;

  try {
    const { endpoint } = subscription;
    let endpointKey = endpoint.split('://')[1];
    endpointKey = endpointKey.split('/')[0];

    const existingSubscriptions = await getSubscriptionsFromFile();

    const result = {
      ...existingSubscriptions,
      [endpointKey]: subscription,
    };

    const formattedJsonResult = JSON.stringify(result, null, 2);
    const resultData = new Uint8Array(Buffer.from(formattedJsonResult));

    await fsp.writeFile('subscriptions.json', resultData);
  } catch (err) {
    console.log('WRITE FILE ERROR', err);
  }
};

const sendNotification = async payload => {
  webpush.setVapidDetails(`mailto:${process.env.EMAIL}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  const subscriptions = await getSubscriptionsFromFile();
  const subscriptionList = Object.values(subscriptions);

  for (const subscription of subscriptionList) {
    const { endpoint, keys } = subscription;

    const pushSubscription = {
      endpoint,
      keys,
    };

    await webpush.sendNotification(pushSubscription, payload);
  }
};

module.exports = {
  appendSubscription,
  sendNotification,
  getSubscriptionsFromFile,
};
