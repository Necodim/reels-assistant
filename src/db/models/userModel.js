const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  chatId: Number,
  firstName: String,
  lastName: String,
  username: String,
  subscription: Object,
  isExpert: { type: Boolean, default: false },
  about: String,
  state: { 
    type: String, 
    default: '' 
  },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }],
}, {
  timestamps: true
});

const User = mongoose.model('User', schema);

module.exports = User;