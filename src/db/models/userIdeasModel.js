const mongoose = require('mongoose');

const userIdeasSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
  sentAt: { type: Date, default: Date.now }
});

userIdeasSchema.index({ userId: 1, ideaId: 1 }, { unique: true });
userIdeasSchema.index({ sentAt: 1 });

const UserIdeas = mongoose.model('UserIdeas', userIdeasSchema);

module.exports = UserIdeas;