const bot = require('./bot');
const { adminUsers } = require('./admin');
const { upsertUser } = require('../db/userService');

const start = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Добро пожаловать в инструмент для взаимодействия экспертов-рилсмэйкеров и блогеров. Вы можете бесплатно просматривать идеи экспертов и тут же их реализовывать, а также получать фидбэк на ваши посты. Для этого воспользуйтесь кнопками ниже:';
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Отправить ролик', callback_data: 'send_video' }],
        [{ text: 'Получить идеи', callback_data: 'get_ideas' }],
        [{ text: 'Настройки', callback_data: 'settings' }],
      ]
    }
  }
  try {
    await upsertUser(msg);
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при получении / создании / обновлении пользователя в БД или при отправке ответа на команду /start:', error);
  }
};

const home = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Главное меню';
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Отправить ролик', callback_data: 'send_video' }],
        [{ text: 'Получить идеи', callback_data: 'get_ideas' }],
        [{ text: 'Настройки', callback_data: 'settings' }],
      ]
    }
  }
  try {
    await upsertUser(msg);
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при получении / создании / обновлении пользователя в БД или при отправке ответа на команду /start:', error);
  }
};

const help = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Если у вас есть какие-то вопросы или вы хотите стать экспертом, напишите @snezone.';
  try {
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Ошибка при отправке ответа на команду /help', error);
  }
};

const expert = async (msg) => {
  const chatId = msg.chat.id;
  try {
    let message;
    if (adminUsers.map(user => user.id).indexOf(chatId) !== -1) {
      message = 'Перешлите мне любое сообщение пользователя, которого вы хотите сделать экспертом.';
    } else {
      message = 'Вам не доступен этот функционал.';
    }
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Ошибка при отправке ответа на команду /expert', error);
  }
};

module.exports = {
  start,
  home,
  help,
  expert,
};