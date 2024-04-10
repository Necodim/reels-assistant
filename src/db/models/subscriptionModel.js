const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  price: Number,
  end: Date
});

subscriptionSchema.index({ userId: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;