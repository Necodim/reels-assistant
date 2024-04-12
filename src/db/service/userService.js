const User = require('../models/userModel');
const Subscription = require('../models/subscriptionModel');

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
  const chatId = msg.from.id;

  try {
    const user = await User.findOne({ username: username });
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

const getLeastFrequentExpert = async () => {
  try {
    const expertFrequency = await Subscription.aggregate([
      { $match: { expertId: { $exists: true } } },
      { $group: { _id: "$expertId", count: { $sum: 1 } } },
      { $sort: { count: 1 } },
      { $limit: 1 }
    ]);

    if (expertFrequency.length === 0) {
      console.error('Нет экспертов в подписках');
      return null;
    }

    const randomExpertNumber = Math.floor(Math.random() * (expertFrequency.length));
    const leastFrequentExpertId = expertFrequency[randomExpertNumber]._id;
    const expert = await User.findOne({ _id: leastFrequentExpertId, isExpert: true });

    if (!expert) {
      console.error('Эксперт не найден');
      return null;
    }

    return expert;
  } catch (error) {
    console.error('Ошибка при поиске наименее загруженного эксперта:', error);
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
  getLeastFrequentExpert,
  upsertUser,
  updateUserState,
};