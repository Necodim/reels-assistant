const User = require('./userModel');

const getUser = async (msg) => {
  const chatId = msg.from.id;

  try {
    let user = await User.findOne({ chatId });
    return user;
  } catch (error) {
    console.error(`В функции getUser пользователь с ID ${chatId} не найден:`, error);
    throw error;
  }
}

const getUserById = async (id) => {
  try {
    let user = await User.findOne({ id });
    return user;
  } catch (error) {
    console.error(`В функции getUserById пользователь с ID ${id} не найден:`, error);
    throw error;
  }
}

const getUserByChatId = async (chatId) => {
  try {
    let user = await User.findOne({ chatId });
    return user;
  } catch (error) {
    console.error(`В функции getUserByChatId пользователь с ID ${chatId} не найден:`, error);
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

    const baseData = new Object();

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

    const user = await User.findOneAndUpdate(
      { chatId },
      { $set: baseData },
      { upsert: true }
    );

    await user.save();
    
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
  getUsers,
  upsertUser,
  updateUserState,
};