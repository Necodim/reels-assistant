const bot = require('../bot');
const { adminUsers } = require('../helpers/admin');
const buttons = require('../helpers/buttons');
const { getUser, upsertUser, updateUserState } = require('../../db/service/userService');

const start = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const user = await upsertUser(msg);
    await updateUserState(chatId, '');
    let message, options;
    if (user.isExpert) {
      message = 'Вы можете опубликовывать идеи, оценивать ролики и отправлять пуши подопечным, чтобы они снимали видео, и не прокрастинировали. Для этого воспользуйтесь кнопками ниже:';
      options = buttons.mainMenu.expert
    } else {
      message = 'Добро пожаловать в инструмент для взаимодействия экспертов-рилсмэйкеров и блогеров. Вы можете бесплатно просматривать идеи экспертов и тут же их реализовывать, а также получать фидбэк на ваши посты. Для этого воспользуйтесь кнопками ниже:';
      options = buttons.mainMenu.user;
    }
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
    console.error('Ошибка при отправке ответа на команду /home:', error);
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
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при отправке ответа на команду /expert', error);
  }
};

const snezone = async (msg) => {
  const chatId = msg.chat.id;
  const options = buttons.goHome;

  if (adminUsers.map(user => user.id).indexOf(chatId) !== -1) {
    try {
      const user = await getUser(msg);
      const message = `Ваша роль изменена. Теперь вы ${user.isExpert ? 'обычный пользователь' : 'эксперт'}!`;
      if (user && user.isExpert) {
        await upsertUser(msg, { isExpert: false });
      } else {
        await upsertUser(msg, { isExpert: true });
      }
      await updateUserState(chatId, '');
      await bot.sendMessage(chatId, message, options);
    } catch (error) {
      console.log('Не удалось сделать пользователя экспертом или разжаловать его:', error)
    }
  }
}

const test = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Тест';
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Тест', callback_data: 'test' }],
        [{ text: '🏠 Главное меню', callback_data: 'home' }],
      ]
    }
  };

  if (adminUsers.map(user => user.id).indexOf(chatId) !== -1) {
    try {
      await bot.sendMessage(chatId, message, options);
    } catch (error) {
      console.log('/test error:', error)
    }
  }
}

module.exports = {
  start,
  home,
  help,
  expert,
  snezone,
  test,
};