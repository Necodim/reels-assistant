const FavoriteIdea = require('../models/favoriteIdeaModel');

const createFavoriteIdea = async (userId, ideaId) => {
  try {
    const favorite = new FavoriteIdea({
      userId: userId,
      ideaId: ideaId
    });
    await favorite.save();
  } catch (error) {
    console.error(`Не удалось добавить идею ${ideaId} в избранное пользователю ${userId}:`, error);
  }
}

module.exports = {
  createFavoriteIdea,
}