const fsp = require('fs').promises;
const webpush = require('web-push');
const Subscription = require('./models/Subscription');

// const getSubscriptionsFromFile = async () => {
//   try {
//     const data = await fsp.readFile('subscriptions.json', 'utf8');
//     const existingSubscriptions = data ? JSON.parse(data) : {};
//     return existingSubscriptions;
//   } catch (err) {
//     console.log('READ SUBSCRIPTIONS FILE ERROR', err);
//     return null;
//   }
// };

const getSubscriptionsFromFile = async () => {
  try {
    const subscriptions = await Subscription.find({});
    console.log('ALL SUBSCRIPTIONS', subscriptions);
    return subscriptions;
  } catch (err) {
    console.log('READ SUBSCRIPTIONS FILE ERROR', err);
    return null;
  }
};

const appendSubscription = async subscription => {
  if (!subscription) return;

  try {
    console.log('SUBSCRIPTION', subscription);
    const newSubscription = new Subscription(subscription);
    const response = await newSubscription.save();
    console.log('response', response);
  } catch (err) {
    console.log('WRITE FILE ERROR', err);
  }
};

// const appendSubscription = async subscription => {
//   if (!subscription) return;

//   try {
//     const { endpoint } = subscription;
//     let endpointKey = endpoint.split('://')[1];
//     endpointKey = endpointKey.split('/')[0];

//     const existingSubscriptions = await getSubscriptionsFromFile();

//     const result = {
//       ...existingSubscriptions,
//       [endpointKey]: subscription,
//     };

//     const formattedJsonResult = JSON.stringify(result, null, 2);
//     const resultData = new Uint8Array(Buffer.from(formattedJsonResult));

//     await fsp.writeFile('subscriptions.json', resultData);
//   } catch (err) {
//     console.log('WRITE FILE ERROR', err);
//   }
// };

const sendNotification = async payload => {
  console.log('payload', payload);
  try {
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
  } catch (error) {
    const expired = await Subscription.deleteOne({ endpoint: error?.endpoint });
    console.log(expired);
    console.log('SEND NOTIFICATION ERROR', error.endpoint);
    if (expired) {
    }
  }
};

module.exports = {
  appendSubscription,
  sendNotification,
  getSubscriptionsFromFile,
};
