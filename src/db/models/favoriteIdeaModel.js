const mongoose = require('mongoose');

const favoriteIdeaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true }
});

const FavoriteIdea = mongoose.model('FavoriteIdea', favoriteIdeaSchema);

module.exports = FavoriteIdea;