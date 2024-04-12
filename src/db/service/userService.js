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
    // Поиск минимального количества подписок у экспертов
    const minCountResult = await Subscription.aggregate([
      { $match: { expertId: { $exists: true } } },
      { $group: { _id: "$expertId", count: { $sum: 1 } } },
      { $sort: { count: 1 } },
      { $limit: 1 }
    ]);

    let experts;
    if (minCountResult.length > 0) {
      const minCount = minCountResult[0].count;
      // Найти всех экспертов с этим минимальным количеством подписок
      experts = await Subscription.aggregate([
        { $match: { expertId: { $exists: true } } },
        { $group: { _id: "$expertId", count: { $sum: 1 } } },
        { $match: { count: minCount } }
      ]);
    }

    if (!experts || experts.length === 0) {
      // Если эксперты с минимальным количеством подписок не найдены, выбрать случайного эксперта
      const randomExpert = await User.aggregate([
        { $match: { isExpert: true } },
        { $sample: { size: 1 } }
      ]);
      if (randomExpert.length > 0) {
        console.log('Выбран случайный эксперт:', randomExpert[0]);
        return randomExpert[0];
      } else {
        console.log('Эксперты не найдены в базе данных.');
        return null;
      }
    }

    const randomExpertNumber = Math.floor(Math.random() * (experts.length));
    
    return experts[randomExpertNumber];
  } catch (error) {
    console.error('Ошибка при поиске наименее загруженных или случайных экспертов:', error);
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