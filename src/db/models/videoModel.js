const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  expertId: mongoose.Schema.Types.ObjectId,
  chatId: Number,
  videoId: String,
  caption: String,
  isEvaluated: { type: Boolean, default: false },
  evaluation: { type: String, default: '' },
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
