const bot = require('../bot');
const { sendVideoToBot, sendIdeaOutside, sendAnswerOutside } = require('../send');
const buttons = require('../helpers/buttons');
const products = require('../helpers/products');
const { findHashtagByNumber } = require('../helpers/hashtags');
const { getUser, updateUserState, getUserByChatId } = require('../../db/service/userService');
const { getIdeaById, updateIdeaById, deleteIdeaById } = require('../../db/service/ideaService');
const { checkDailyLimit, fetchIdeaForUser } = require('../../db/service/userIdeasService');
const { createFavoriteIdea } = require('../../db/service/favoriteIdeaService');
const { getVideoById, updateVideoById, setVideoEvaluateTo, getNextUnratedVideo } = require('../../db/service/videoService');
const message = require('../events/message');
const { getUserSubscriptions } = require('../../db/service/subscriptionService');
const { formatDate } = require('../../helpers/dateHelper');

const handleError = (error, callbackQuery) => {
  if (error.message === 'Новые идеи не найдены') {
    bot.sendMessage(callbackQuery.from.id, 'На данный момент новых идей нет, но скоро появятся. Мы работаем над этим 😉');
  } else if (error.message === 'Новые видео для оценки не найдены') {
    bot.sendMessage(callbackQuery.from.id, 'На данный момент новых видео от пользователей нет 😉');
  } else {
    console.error(`Ошибка в callbackQuery (${callbackQuery.data})`, error);
  }
}

const home = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const message = 'Главное меню';

  try {
    const user = await getUser(callbackQuery);

    const options = user.isExpert ? buttons.mainMenu.expert : buttons.mainMenu.user;
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const settings = async (callbackQuery) => {
  try {
    const user = await getUser(callbackQuery);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const sendVideo = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const message = 'Прикрепите ролик и напишите сопроводительное сообщение, если необходимо. Если передумали, вернитесь в главное меню.';
  const options = buttons.goHome;

  try {
    await updateUserState(chatId, 'videoAwaiting');
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const getIdea = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;

  try {
    const user = await getUser(callbackQuery);
    const canFetch = await checkDailyLimit(user.id);
    if (!canFetch) {
      const message = `5 бесплатных идей для рилс на сегодня закончились, завтра будут новые!
${products.text}`;
      const options = buttons.purchase.user;
      await bot.sendMessage(chatId, message, options);
    } else {
      const idea = await fetchIdeaForUser(user.id);
      const caption = `${idea.caption}

Сложность: ${idea.difficulty}
${idea.hashtag}`
      // const options = {...buttons.moreOrGoHome.user(idea.id), caption}; // для добавления идеи в избранное
      const options = {...buttons.moreOrGoHome.user, caption};
      await sendVideoToBot(chatId, idea.videoId, options);
    }
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const favorite = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const ideaId = callbackQuery.data.split(':')[1];

  try {
    const user = await getUserByChatId(chatId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    await createFavoriteIdea(user.id, ideaId);
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Идея добавлена в избранное' });
  } catch (error) {
    console.error('Ошибка при добавлении идеи в избранное:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка при добавлении идеи в избранное' });
  }
}

const sendMeVideo = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const videoId = callbackQuery.data.split(':')[1];

  try {
    const video = await getVideoById(videoId);
    const options = {caption: video.caption};
    await sendVideoToBot(chatId, video.videoId, options);
  } catch (error) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка' });
    console.error('Ошибка при отправке видео пользователю:', error);
  }
}

const purchase = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const pNumber = parseInt(callbackQuery.data.split(':')[1], 10);
  const product = products.products[pNumber];
  const link = product.link;
  const message = `<b>Продукт:</b> ${product.name}

Нажмите на кнопку, чтобы перейти на страницу оплаты. После успешной оплаты возвращайтесь обратно, я сообщу, когда подписка будет оформлена.`
  const options = {...buttons.purchase.cloudpayments(link), parse_mode: 'HTML' };

  try {
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка' });
    console.error('Ошибка при отправке пользователю ссылок на оплату:', error);
  }
}

const subscription = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  
  try {
    const user = await getUser(callbackQuery);
    const subscriptions = await getUserSubscriptions(user.id);
    let message
    if (subscriptions.length) {
      if (subscriptions.length > 0) {
        const date = formatDate(subscriptions[0].end, 'd MMMM, HH:mm');
        message = 'У вас больше одной подписки:';
        subscriptions.forEach((subscription, i) => {
          message = `${message}
${(i+1)}. ${subscription.name} (дата продления: ${date})`;
        });
      } else {
        const date = formatDate(subscriptions[0].end, 'd MMMM, HH:mm');
        message = `У вас уже есть подписка. Дата продления: ${date}`;
      }
    } else {
      message = `У вас нет подписки. В подписке за 990₽/месяц вам доступно:
${products.text}`;
    }
    const options = buttons.purchase.user;
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при отправке пользователю callbackQuery subscription:', error);
  }
}

const createIdea = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const options = buttons.goHome;
  
  try {
    const user = await getUser(callbackQuery);
    if (user.isExpert) {
      const message = 'Отправьте в одном сообщении идею: видео и текстовое описание.';
      await updateUserState(chatId, 'ideaAwaiting');
      await bot.sendMessage(chatId, message, options);
    } else {
      const message = 'Вам не доступен этот функционал.';
      await bot.sendMessage(chatId, message, options);
    }
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const difficulty = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
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
    handleError(error, callbackQuery);
  }
}

const hashtag = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const message = 'Супер. Идея добавлена.';
  const options = buttons.moreOrGoHome.expert;
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
    const btns = buttons.channel.delete(videoId);
    await sendIdeaOutside(videoId, btns);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const getVideo = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const message = `Оцените ролик пользователя. Принимается только текстовое описание без вложений. Для удобства мы подготовили для вас шаблон:
<code>Суть видео:
Заголовок:
Целевое действие:
Видеоряд:
Что улучшить:</code>

👆 Нажмите на текст, чтобы скопировать

• вставьте текст в поле ввода сообщения
• напишите обратную связь по каждому пункту
• отправьте сообщение

✅ оно автоматически уйдет получателю`;
  
  try {
    const video = await getNextUnratedVideo();
    await setVideoEvaluateTo(video.id, true);
    const videoOptions = {caption: video.caption};
    const videoMessage = await sendVideoToBot(chatId, video.videoId, videoOptions);
    const options = {...buttons.cancel.videoEvaluate(video.id, videoMessage.message_id), parse_mode: 'HTML'};
    await bot.sendMessage(chatId, message, options);
    await updateUserState(chatId, `evaluateAwaiting:${video.id}`);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const cancelVideoEvaluate = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const videoId = callbackQuery.data.split(':')[1];
  const messageWithVideoToDelete = callbackQuery.data.split(':')[2];
  try {
    await updateUserState(chatId, '');
    await setVideoEvaluateTo(videoId, false);
    await bot.deleteMessage(chatId, callbackQuery.message.message_id);
    await bot.deleteMessage(chatId, messageWithVideoToDelete);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const editEvaluateMessage = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const videoId = callbackQuery.data.split(':')[2];
  const message = 'Пришлите новый вариант оценки ролика';
  
  try {
    const user = await getUserByChatId(chatId);
    const updateData = {
      isEvaluated: true,
      evaluation: '',
      evaluatedBy: user.id
    }
    await updateVideoById(videoId, updateData);
    await bot.sendMessage(chatId, message);
    await updateUserState(chatId, `evaluateAwaiting:${videoId}`);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const sendEvaluateMessage = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const videoId = callbackQuery.data.split(':')[2];
  const message = 'Оценка отправлена пользователю';

  try {
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Загрузка...', show_alert: false });
    await updateUserState(chatId, '');
    await bot.sendMessage(chatId, message);
    const video = await getVideoById(videoId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await home(callbackQuery);

    const videoMessage = `<b>Вы получили оценку ролика от эксперта</b>
<blockquote>${video.evaluation}</blockquote>
`;
    const videoOptions = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🤔 Что за ролик?', callback_data: `getvd:${videoId}` }],
          [{ text: '🏠 Главное меню', callback_data: 'home' }],
        ]
      },
      parse_mode: 'HTML'
    };
    await bot.sendMessage(video.chatId, videoMessage, videoOptions);
    await sendAnswerOutside(videoId);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const toPush = async (callbackQuery) => {

}

const channelMessageDelete = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const ideaId = callbackQuery.data.split(':')[2];
  
  try {
    await deleteIdeaById(ideaId);
    await bot.deleteMessage(chatId, callbackQuery.message.message_id);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const support = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const message = 'По всем вопросам пишите @snezone';
  const options = buttons.snezone;

  try {
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const test = async (callbackQuery) => {
  console.log(callbackQuery);
  try {
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Тест успешно проведён' });
    await bot.sendMessage(callbackQuery.from.id, 'Тест успешно проведён');
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

module.exports = {
  home,
  settings,
  sendVideo,
  getIdea,
  favorite,
  sendMeVideo,
  purchase,
  subscription,
  createIdea,
  difficulty,
  hashtag,
  getVideo,
  cancelVideoEvaluate,
  editEvaluateMessage,
  sendEvaluateMessage,
  toPush,
  channelMessageDelete,
  support,
  test,
};