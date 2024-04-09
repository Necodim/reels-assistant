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
    case 'home':
      await callback.home(callbackQuery);
      break;
    case 'sendVideo':
      await callback.sendVideo(callbackQuery);
      break;
    case 'getIdea':
      await callback.getIdea(callbackQuery);
      break;
    case 'prchs':
      await callback.purchase(callbackQuery);
      break;
    case 'createIdea':
      await callback.createIdea(callbackQuery);
      break;
    case 'dfclt':
      await callback.difficulty(callbackQuery);
      break;
    case 'hshtg':
      await callback.hashtag(callbackQuery);
      break;
    case 'chanl':
      switch (action) {
        case 'del':
          await callback.channelMessageDelete(callbackQuery);
          break;
        default:
          console.log(`Неизвестный action (${action}) для callback_data_query: ${data}`);
          await bot.sendMessage(chatId, `Неизвестный action (${action}) для callback_data_query: ${data}`);
          break;
      }
      break;
    default:
      console.log(`Неизвестный callback_data_query: ${data}`);
      await bot.sendMessage(chatId, `Неизвестный callback_data_query: ${data}`);
      break;
  }
}