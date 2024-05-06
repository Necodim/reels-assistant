const mongoose = require('mongoose');
const UserIdea = require('../models/userIdeasModel');
const Idea = require('../models/ideaModel');
const Subscription = require('../models/subscriptionModel');

const DAILY_IDEA_LIMIT = 5;

const findNewIdeaForUser = async (userId) => {
  const userIdObj = new mongoose.Types.ObjectId(userId);

  try {
    const newIdea = await Idea.aggregate([
      {
        $lookup: {
          from: "userideas",
          let: { ideaId: "$_id" },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [ 
                    { $eq: ["$ideaId", "$$ideaId"] }, 
                    { $eq: ["$userId", userIdObj] }
                  ]
                } 
              } 
            }
          ],
          as: "sentIdeas"
        }
      },
      {
        $match: {
          "sentIdeas": { $size: 0 }
        }
      },
      { $sort: { createdAt: 1 } },
      { $limit: 1 }
    ]);
  
    if (newIdea.length === 0) {
      throw new Error('Новые идеи не найдены');
    }
  
    return newIdea[0];
  } catch (error) {
    console.error('Ошибка при поиске идеи эксперта в БД:', error);
  }
};

const checkDailyLimit = async (userId) => {
  const userIdObj = new mongoose.Types.ObjectId(userId);

  try {
    const activeSubscription = await Subscription.findOne({
      userId: userIdObj,
      status: 'Active'
    });
    
    if (activeSubscription) {
      return true;
    }
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const ideasCountToday = await UserIdea.countDocuments({
      userId,
      sentAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return ideasCountToday < DAILY_IDEA_LIMIT;
  } catch (error) {
    console.error('Ошибка при проверке дневного лимита пользователя:', error);
    throw error;
  }
};

const saveSentIdeaInfo = async (userId, ideaId) => {
  try {
    const sentIdea = new UserIdea({
      userId,
      ideaId,
      sentAt: new Date(),
    });

    await sentIdea.save();
    console.log(`Информация об идее ${ideaId} для пользователя ${userId} сохранена.`);
  } catch (error) {
    console.error(`Ошибка при сохранении информации об отправленной идее ${ideaId}:`, error);
    throw error;
  }
};

const fetchIdeaForUser = async (userId) => {
  try {
    const newIdea = await findNewIdeaForUser(userId);
    if (!newIdea) {
      return {message: 'Новых идей пока что нет, вы просмотрели всё, что на данный момент придумали наши эксперты. Приходите чуть позже 😉'}
    }
  
    await saveSentIdeaInfo(userId, newIdea._id);
  
    return newIdea;
  } catch (error) {
    console.error('Ошибка при запросе новой идеи для пользователя:', error);
  }
};

module.exports = {
  checkDailyLimit,
  fetchIdeaForUser,
}