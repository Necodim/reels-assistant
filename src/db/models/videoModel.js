const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  chatId: Number,
  videoId: String,
  caption: String,
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;