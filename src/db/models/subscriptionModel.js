const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  price: Number,
  subscriptionId: String,
  end: Date
}, {
  timestamps: true
});

subscriptionSchema.index({ userId: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;