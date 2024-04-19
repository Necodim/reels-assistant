const User = require('../models/userModel');
const Video = require('../models/videoModel');
const Subscription = require('../models/subscriptionModel');
const Idea = require('../models/ideaModel');
const UserIdea = require('../models/userIdeasModel');
const { adminUsers } = require('../../bot/helpers/admin');

const getUser = async (msg) => {
  const chatId = msg.from.id;

  try {
    const user = await User.findOne({ chatId });
    return user;
  } catch (error) {
    console.error(`В функции getUser пользователь с ID ${chatId} не найден:`, error);
    throw error;
  }
}

const getUserById = async (id) => {
  try {
    const user = await User.findOne(id);
    return user;
  } catch (error) {
    console.error(`В функции getUserById пользователь с ID ${id} не найден:`, error);
    throw error;
  }
}

const getUserByChatId = async (chatId) => {
  try {
    const user = await User.findOne({ chatId });
    return user;
  } catch (error) {
    console.error(`В функции getUserByChatId пользователь с ID ${chatId} не найден:`, error);
    throw error;
  }
}

const getUserByUsername = async (username) => {
  try {
    const regex = new RegExp(`^${username.replace('@', '')}$`, 'i');
    const user = await User.findOne({ username: { $regex: regex } });
    return user;
  } catch (error) {
    console.error(`В функции getUser пользователь с username ${username} не найден:`, error);
    throw error;
  }
}

const getUsers = async (params) => {
  try {
    const users = await User.find(params);
    return users;
  } catch (error) {
    console.error('Ошибка при поиске пользователей:', error);
    throw error;
  }
}

const getUsersForVideoReminder = async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const users = await User.find({ isExpert: false });
  for (const user of users) {
    const currentDate = new Date();
    const activeSubscription = await Subscription.findOne({
      userId: user._id,
      $or: [
        { status: 'Active' },
        { end: { $gte: currentDate } }
      ]
    });

    const result = new Array();
    if (activeSubscription) {
      const lastVideo = await Video.findOne({ userId: user._id }).sort({ createdAt: -1 });
      if (!lastVideo || lastVideo.createdAt < threeDaysAgo) {
        result.push(user);
      }
    }

    return result;
  }
};

const getLeastFrequentExpert = async () => {
  try {
    const allExperts = await User.aggregate([
      { $match: { isExpert: true } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "expertId",
          as: "subscriptions"
        }
      },
      {
        $project: {
          _id: 1,
          subscriptions: 1,
          subscriptionCount: { $size: "$subscriptions" }
        }
      },
      { $sort: { subscriptionCount: 1 } }
    ]);

    const adminIds = adminUsers.map(user => user._id);
    const filteredExperts = allExperts.filter(user => !adminIds.includes(user._id));

    if (filteredExperts.length > 0) {
      const minCount = allExperts[0].subscriptionCount;
      const leastBusyExperts = allExperts.filter(expert => expert.subscriptionCount === minCount);
      const randomIndex = Math.floor(Math.random() * leastBusyExperts.length);
      const randomExpertId = leastBusyExperts[randomIndex]._id;
      const expertDetails = await User.findById(randomExpertId);
      if (expertDetails) {
        console.log('Выбран случайный эксперт с минимальным количеством подписок:', expertDetails);
        return expertDetails;
      }
    }

    const fallbackExpert = await User.findOne({ isExpert: true }).sort({ _id: -1 }).limit(1);
    console.log('Выбран случайный эксперт:', fallbackExpert);
  } catch (error) {
    console.error('Ошибка при поиске наименее загруженных экспертов:', error);
    throw error;
  }
}

const upsertUser = async (msg, params = {}) => {
  try {
    const chatId = msg.forward_from ? msg.forward_from.id : msg.from.id;

    const baseData = {
      chatId,
    };

    if (!msg.forward_from) {
      Object.assign(baseData, {
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
        username: msg.from.username,
        ...params,
      });
    } else {
      Object.assign(baseData, {
        firstName: msg.forward_from.first_name,
        lastName: msg.forward_from.last_name,
        username: msg.forward_from.username,
        ...params,
      });
    }

    let user = await User.findOne({ chatId });

    if (user) {
      await User.updateOne({ chatId }, { $set: baseData });
    } else {
      user = new User(baseData);
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Ошибка при обновлении или создании пользователя:', error);
    throw error;
  }
}

const getUsersCount = async () => {
  try {
    const count = await User.estimatedDocumentCount({ isExpert: false });
    return count;
  } catch (error) {
    console.error('Ошибка при подсчёте количества подписок:', error);
  }
}

const updateUserState = async (chatId, newState) => {
  try {
    await User.findOneAndUpdate({ chatId }, { $set: { state: newState } });
  } catch (error) {
    console.error('Ошибка при обновлении состояния пользователя:', error);
    throw error;
  }
}

module.exports = {
  getUser,
  getUserById,
  getUserByChatId,
  getUserByUsername,
  getUsers,
  getUsersForVideoReminder,
  getLeastFrequentExpert,
  upsertUser,
  getUsersCount,
  updateUserState,
};