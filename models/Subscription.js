const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  endpoint: String,
  expirationTime: String,
  keys: {
    p256dh: String,
    auth: String,
  },
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
