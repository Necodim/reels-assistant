const bot = require('./bot');
const buttons = require('./buttons');
const { findHashtagByNumber } = require('./hashtags');
const { getUser, updateUserState } = require('../db/userService');
const { getIdeaById, updateIdeaById, deleteIdeaById } = require('../db/ideaService');
const { sendIdeaToChannel } = require('./channel');

const handleError = (error, data) => {
  console.error(`Ошибка в callbackQuery (${data})`, error);
}

const home = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const message = 'Главное меню';

  try {
    const user = await getUser(callbackQuery);

    const options = user.isExpert ? buttons.mainMenu.expert : buttons.mainMenu.user;
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const settings = async (callbackQuery) => {
  try {
    const user = await getUser(callbackQuery);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const sendVideo = async (callbackQuery) => {
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

const getIdeas = async (callbackQuery) => {

}

const createIdea = async (callbackQuery) => {
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

const difficulty = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const difficulty = callbackQuery.data.split(':')[1];
  const videoId = callbackQuery.data.split(':')[2];
  const message = 'Спасибо, я сохранил вашу идею. Теперь выберите хэштег:';
  const options = buttons.hashtags(videoId);
  const updateData = {
    difficulty: difficulty
  }

  try {
    await updateIdeaById(videoId, updateData);
    await updateUserState(chatId, 'hashtagAwaiting');
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const hashtag = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const message = 'Супер. Идея добавлена.';
  const options = buttons.addAnotherAndGoHome;
  const hNumber = callbackQuery.data.split(':')[1];
  const hashtag = findHashtagByNumber(hNumber);
  const videoId = callbackQuery.data.split(':')[2];
  const updateData = {
    hashtag: hashtag
  }

  try {
    await updateIdeaById(videoId, updateData)
    await updateUserState(chatId, '');
    await bot.sendMessage(chatId, message, options);
    await sendIdeaToChannel(videoId);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const getVideo = async (callbackQuery) => {

}

const toPush = async (callbackQuery) => {

}

const channelMessageDelete = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const message = 'Эта идея удалена из базы данных';
  const ideaId = callbackQuery.data.split(':')[2];
  
  await deleteIdeaById(ideaId);
  await bot.deleteMessage(chatId, callbackQuery.message.id);
  await bot.sendMessage(chatId, message);
}

module.exports = {
  home,
  settings,
  sendVideo,
  getIdeas,
  createIdea,
  difficulty,
  hashtag,
  getVideo,
  toPush,
  channelMessageDelete,
};