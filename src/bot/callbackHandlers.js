const bot = require('./bot');
const buttons = require('./buttons');
const hashtags = require('./hashtags');
const { getUser, updateUserState } = require('../db/userService');
const { getIdea, updateIdea } = require('../db/ideaService');
const { sendIdeaToChannel } = require('./channel');

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

const difficulty = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const difficulty = callbackQuery.data.split(':')[1];
  const videoId = callbackQuery.data.split(':')[2];
  const message = 'Спасибо, я сохранил вашу идею. Теперь выберите хэштег:';
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Коммерческая', callback_data: `hashtag:1:${videoId}` },
          { text: 'Экспертная', callback_data: `hashtag:2:${videoId}` },
        ],
      ]
    }
  };
  const updateData = {
    difficulty: difficulty
  }

  try {
    const idea = await updateIdea(videoId, updateData);
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
    await updateIdea(videoId, updateData)
    await updateUserState(chatId, '');
    await bot.sendMessage(chatId, message, options);
    await sendIdeaToChannel(videoId);
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
  difficulty,
  hashtag,
  get_video,
  to_push,
};