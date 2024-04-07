const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  chatId: Number,
  firstName: String,
  lastName: String,
  username: String,
  isExpert: { type: Boolean, default: false },
}, {
  timestamps: true
});

const User = mongoose.model('User', schema);

module.exports = User;