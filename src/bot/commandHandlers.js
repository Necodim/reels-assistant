const bot = require('./bot');
const { adminUsers } = require('./admin');
const buttons = require('./buttons');
const { upsertUser, updateUserState } = require('../db/userService');

const start = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Добро пожаловать в инструмент для взаимодействия экспертов-рилсмэйкеров и блогеров. Вы можете бесплатно просматривать идеи экспертов и тут же их реализовывать, а также получать фидбэк на ваши посты. Для этого воспользуйтесь кнопками ниже:';
  
  try {
    const user = await upsertUser(msg);
    await updateUserState(chatId, '');
    const options = user.isExpert ? buttons.mainMenu.expert : buttons.mainMenu.user;
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при получении / создании / обновлении пользователя в БД или при отправке ответа на команду /start:', error);
  }
};

const home = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Главное меню';

  try {
    const user = await getUser(msg);
    await updateUserState(chatId, '');
    const options = user.isExpert ? buttons.mainMenu.expert : buttons.mainMenu.user;
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при получении / создании / обновлении пользователя в БД или при отправке ответа на команду /start:', error);
  }
};

const help = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Если у вас есть какие-то вопросы или вы хотите стать экспертом, напишите @snezone.';
  try {
    await updateUserState(chatId, '');
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Ошибка при отправке ответа на команду /help', error);
  }
};

const expert = async (msg) => {
  const chatId = msg.chat.id;
  const options = buttons.goHome;
  try {
    await updateUserState(chatId, 'forwardExpertWaiting');
    let message;
    if (adminUsers.map(user => user.id).indexOf(chatId) !== -1) {
      message = 'Перешлите мне любое сообщение пользователя, которого вы хотите сделать экспертом или разжаловать.';
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