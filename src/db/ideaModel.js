const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  chatId: Number,
  videoId: String,
  caption: String,
  createdAt: { type: Date, default: Date.now }
});

const Idea = mongoose.model('Idea', ideaSchema);

module.exports = Idea;