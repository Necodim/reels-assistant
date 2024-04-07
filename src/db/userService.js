const User = require('./userModel');

const getUser = async (data) => {
  let chatId;

  if (typeof data === 'number') {
    chatId = data;
  } else if (typeof data === 'object' && data.from && typeof data.from.id === 'number') {
    chatId = data.from.id;
  } else {
    throw new Error('Неверный формат входных данных для получения пользователя');
  }

  try {
    let user = await User.findOne({ chatId: chatId });
    return user;
  } catch (error) {
    console.error(`Пользователь с ID ${chatId} не найден:`, error);
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
  getUsers,
  upsertUser,
  updateUserState,
};