const bot = require('./bot');
const buttons = require('./buttons');
const { getUser, updateUserState } = require('../db/userService');

const handleError = (error, data) => {
  console.error(`Ошибка в callbackQuery (${data})`, error);
}

const home = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const message = 'Главное меню';

  try {
    const user = await getUser(callbackQuery.message);

    const options = user.isExpert ? buttons.mainMenu.expert : buttons.mainMenu.user;
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const settings = async (callbackQuery) => {
  try {
    const user = await getUser(callbackQuery.message);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const send_video = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const message = 'Прикрепите ролик и напишите сопроводительное сообщение, если необходимо. Если передумали, вернитесь в главное меню.';
  const options = buttons.goHome;

  try {
    await updateUserState(chatId, 'videoAwaiting');
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const get_ideas = async (callbackQuery) => {

}

const new_idea = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const message = 'Отправьте в одном сообщении идею: видео и текстовое описание.';
  const options = buttons.goHome;

  try {
    await updateUserState(chatId, 'ideaAwaiting');
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const get_video = async (callbackQuery) => {

}

const to_push = async (callbackQuery) => {

}

module.exports = {
  home,
  settings,
  send_video,
  get_ideas,
  new_idea,
  get_video,
  to_push,
};