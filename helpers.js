const webpush = require('web-push');
const Subscription = require('./models/Subscription');

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
    const { endpoint } = subscription;
    const existingSubscription = await Subscription.findOneAndReplace(
      {
        endpoint,
      },
      subscription,
    );

    if (!existingSubscription) {
      console.log('NEW ONE');
      const newSubscription = new Subscription(subscription);
      const response = await newSubscription.save();
      return response;
    }

    console.log('REPLACED');
    return existingSubscription;
  } catch (err) {
    console.log('APPEND SUBSCRIPTION ERROR', err);
  }
};

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
