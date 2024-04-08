const bot = require('./bot');
const buttons = require('./buttons');
const hashtags = require('./hashtags');
const { getUser, updateUserState } = require('../db/userService');
const { getIdea, updateIdeaById } = require('../db/ideaService');
const { sendIdeaToChannel } = require('./channel');

const handleError = (error, data) => {
  console.error(`Ошибка в callbackQuery (${data})`, error);
}

const home = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const message = 'Главное меню';

  try {
    console.log(callbackQuery)
    const user = await getUser(callbackQuery);
    console.log(user)

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
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Коммерческая', callback_data: `hshtg:1:${videoId}` },
          { text: 'Экспертная', callback_data: `hshtg:2:${videoId}` },
        ],
      ]
    }
  };
  const updateData = {
    difficulty: difficulty
  }

  try {
    const idea = await updateIdeaById(videoId, updateData);
    await updateUserState(chatId, 'hashtagAwaiting');
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery.data);
  }
}

const hashtag = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const message = 'Супер. Идея добавлена.';
  const options = buttons.goHome;
  const hNumber = callbackQuery.data.split(':')[1];
  const hashtag = hashtags.find(el => el.num == hNumber);
  const videoId = callbackQuery.data.split(':')[2];

  try {
    const idea = await getIdea(videoId);
    const updateData = {
      caption: `${caption}
      
Сложность: ${idea.difficulty}
${hashtag}`,
      hashtag: hashtag
    }
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
};