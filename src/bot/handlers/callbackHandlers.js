const bot = require('../bot');
const { sendVideoToBot, sendIdeaOutside, sendAnswerOutside } = require('../send');
const buttons = require('../helpers/buttons');
const products = require('../helpers/products');
const { findHashtagByNumber } = require('../helpers/hashtags');
const { getUser, updateUserState, getUserByChatId, getUserById } = require('../../db/service/userService');
const { getIdeaById, updateIdeaById, deleteIdeaById } = require('../../db/service/ideaService');
const { checkDailyLimit, fetchIdeaForUser } = require('../../db/service/userIdeasService');
const { createFavoriteIdea } = require('../../db/service/favoriteIdeaService');
const { getVideoById, updateVideoById, setVideoEvaluateTo, getNextUnratedVideo } = require('../../db/service/videoService');
const message = require('../events/message');
const { getUserSubscriptions, getSubscriptionById, getUserSubscription, updateSubscription, getExpertSubscriberCount } = require('../../db/service/subscriptionService');
const { formatDate } = require('../../helpers/dateHelper');
const { subscriptionsCancel } = require('../../payments/cloudpaymentAPI');
const emojiHelper = require('../../helpers/emojiHelper');
const { getPlural } = require('../../helpers/getPlural');

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

    const options = user.isExpert ? buttons.mainMenu('expert') : buttons.mainMenu('user');
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

  try {
    const user = await getUser(callbackQuery);
    const subscriptions = await getUserSubscriptions(user._id);
    if (subscriptions.length) {
      await updateUserState(chatId, 'videoAwaiting');
      const message = 'Прикрепите ролик и напишите сопроводительное сообщение, если необходимо. Если передумали, вернитесь в главное меню:';
      const options = buttons.home();
      await bot.sendMessage(chatId, message, options);
    } else {
      await updateUserState(chatId, '');
      const message = 'Эта функция доступна только по подписке. Перейдите в соответствующий раздел для оформления:';
      const options = buttons.home('subscription');
      await bot.sendMessage(chatId, message, options);
    }
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
      const options = buttons.purchase.user();
      await bot.sendMessage(chatId, message, options);
    } else {
      const idea = await fetchIdeaForUser(user.id);
      const caption = `${idea.caption}

Сложность: ${idea.difficulty}
${idea.hashtag}`
      // const options = {...buttons.home('getYetIdea')(idea.id), caption}; // для добавления идеи в избранное
      const options = {...buttons.home('getYetIdea'), caption};
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

const createSubscription = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  
  try {
    const user = await getUser(callbackQuery);
    const subscriptions = await getUserSubscriptions(user.id);
    let message;
    if (subscriptions.length > 0) {
      if (subscriptions.length > 1) {
        message = 'У вас больше одной подписки:';
        subscriptions.forEach((subscription, i) => {
          const emoji = emojiHelper.number(i);
          message += `
${i > 9 ? `${i+1}.` : emoji} ${subscription.name}`;
        });
      } else {
        message = 'У вас одна подписка:';
        subscriptions.forEach((subscription, i) => {
          message += `
1️⃣ ${subscription.name}`;
        });
      }
      message += `

Если хотите оформить ещё одну подписку, выберите её название в списке ниже. Для просмотра информации и управления конкретной подпиской, нажмите соответствующее ей число:`
    } else {
      message = `У вас нет подписок. В подписке за 990₽/месяц вы получите:
${products.text}`;
    }
    const options = buttons.purchase.user(subscriptions);
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при отправке пользователю callbackQuery subscription:', error);
  }
}

const getSubscription = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const subscriptionId = callbackQuery.data.split(':')[1];
  
  try {
    const user = await getUser(callbackQuery);
    const subscription = await getUserSubscription(user.id, subscriptionId);
    const options = {...buttons.home(`cnlsb:${subscription.id}`), parse_mode: 'HTML'};
    console.log(subscription);
    const date = formatDate(subscription.end, 'd MMMM, HH:mm');
    const message = `Название: ${subscription.name}
Дата ${subscription.status === 'Active' ? 'следующего списания' : 'окончания срока действия'}: ${date}

Информация о вашем эксперте:
<blockquote>${subscription.expertId.about}</blockquote>`
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при отправке пользователю callbackQuery getSubscription:', error);
  }
}

const cancelSubscription = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const subscriptionId = callbackQuery.data.split(':')[1];
  console.log(callbackQuery.data);
  
  try {
    const subscription = getSubscriptionById(subscriptionId);
    const response = await subscriptionsCancel(subscription.subscriptionId);
    console.log(response)
    if (response.Success) {
      const updatedSubscription = await updateSubscription(subscription._id, { status: response.Success });
      
      const date = formatDate(subscription.end, 'd MMMM, HH:mm');
      const messageUser = `Вы успешно отменили подписку ${subscription.name}. Она будет действовать до ${date}`;
      const optionsUser = buttons.home();
      await bot.sendMessage(chatId, messageUser, optionsUser);

      // const expert = await getUserById(updatedSubscription.expertId);
      // const messageExpert = 'Один из ваших подопечных отменил подписку';
      // await bot.sendMessage(expert.chatId, messageExpert);
    } else {
      const message = 'Произошла ошибка, попробуйте ещё раз. Если ошибка повторится, обратитесь в поддержку.';
      const options = buttons.home('support');
      await bot.sendMessage(chatId, message, options);
      throw Error('CloudPayments не смог отменить подписку');
    }
  } catch (error) {
    console.error('Ошибка при отмене подписки:', error);
  }
}

const createIdea = async (callbackQuery) => {
  const chatId = callbackQuery.from.id;
  const options = buttons.home();
  
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
  const options = buttons.home('createYetIdea');
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

const settingsUser = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const message = 'Упс! А для настроек нет...';

  try {
    await bot.sendMessage(chatId, message);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const settingsExpert = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const options = buttons.home('about');

  try {
    const user = await getUser(callbackQuery);
    const subscribers = await getExpertSubscriberCount(user._id);
    const message = `На данный момент у вас ${subscribers.unique} ${getPlural(subscribers.unique, 'подопечный', 'подопечных', 'подопечных')}. Так же в этом разделе вы можете настроить информацию о себе.`;
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const aboutExpert = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const message = 'Пришлите текст о себе. Этот текст пользователь увидит, когда оформит подписку и станет вашим подопечным.';

  try {
    await updateUserState(chatId, 'aboutAwaiting');
    await bot.sendMessage(chatId, message);
  } catch (error) {
    handleError(error, callbackQuery);
  }
}

const outsideMessageDelete = async (callbackQuery) => {
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
  createSubscription,
  getSubscription,
  cancelSubscription,

  createIdea,
  difficulty,
  hashtag,

  getVideo,
  cancelVideoEvaluate,
  editEvaluateMessage,
  sendEvaluateMessage,

  toPush,
  settingsUser,
  settingsExpert,
  aboutExpert,

  outsideMessageDelete,
  support,
  test,
};