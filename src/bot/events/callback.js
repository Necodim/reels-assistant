const bot = require('../bot');
const callback = require('../handlers/callbackHandlers');
const { updateUserState } = require('../../db/service/userService');

module.exports = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':')[0];
  const action = callbackQuery.data.split(':')[1];

  await bot.answerCallbackQuery(callbackQuery.id);
  await updateUserState(chatId, '');

  switch (data) {
    case 'about':
      await callback.aboutExpert(callbackQuery);
      break;
    case 'cnlsb':
      await callback.cancelSubscription(callbackQuery);
      break;
    case 'cnlve':
      await callback.cancelVideoEvaluate(callbackQuery);
      break;
    case 'createIdea':
      await callback.createIdea(callbackQuery);
      break;
    case 'dfclt':
      await callback.difficulty(callbackQuery);
      break;
    case 'evalt':
      switch (action) {
        case 'edit':
          await callback.editEvaluateMessage(callbackQuery);
          break;
        case 'send':
          await callback.sendEvaluateMessage(callbackQuery);
          break;
        default:
          console.log(`Неизвестный action (${action}) для callback_data_query: ${data}`);
          await bot.sendMessage(chatId, `Неизвестный action (${action}) для callback_data_query: ${data}`);
          break;
      }
      break;
    case 'favrt':
      await callback.favorite(callbackQuery);
      break;
    case 'getIdea':
      await callback.getIdea(callbackQuery);
      break;
    case 'getsb':
      await callback.getSubscription(callbackQuery);
      break;
    case 'getvd':
      await callback.sendMeVideo(callbackQuery);
      break;
    case 'getVideo':
      await callback.getVideo(callbackQuery);
      break;
    case 'home':
      await callback.home(callbackQuery);
      break;
    case 'hshtg':
      await callback.hashtag(callbackQuery);
      break;
    case 'outsd':
      switch (action) {
        case 'del':
          await callback.outsideMessageDelete(callbackQuery);
          break;
        default:
          console.log(`Неизвестный action (${action}) для callback_data_query: ${data}`);
          await bot.sendMessage(chatId, `Неизвестный action (${action}) для callback_data_query: ${data}`);
          break;
      }
      break;
    case 'prchs':
      await callback.purchase(callbackQuery);
      break;
    case 'send2':
      await callback.sendTo(callbackQuery);
      break;
    case 'sendVideo':
      await callback.sendVideo(callbackQuery);
      break;
    case 'stngs':
      switch (action) {
        case 'user':
          await callback.settingsUser(callbackQuery);
          break;
        case 'expert':
          await callback.settingsExpert(callbackQuery);
          break;
        default:
          console.log(`Неизвестный action (${action}) для callback_data_query: ${data}`);
          await bot.sendMessage(chatId, `Неизвестный action (${action}) для callback_data_query: ${data}`);
          break;
      }
      break;
    case 'subscription':
      await callback.createSubscription(callbackQuery);
      break;
    case 'support':
      await callback.support(callbackQuery);
      break;
    case 'test':
      await callback.test(callbackQuery);
      break;
    default:
      console.log(`Неизвестный callback_data_query: ${data}`);
      await bot.sendMessage(chatId, `Неизвестный callback_data_query: ${data}`);
      break;
  }
}