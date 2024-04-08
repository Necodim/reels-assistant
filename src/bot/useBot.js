const bot = require('./bot');
const command = require('./commandHandlers');
const callback = require('./callbackHandlers');
const { videoAwaiting, forwardExpertAwaiting, ideaAwaiting } = require('./messageHandlers');
const { getUser, updateUserState } = require('../db/userService');

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  // console.log(msg)
  
  if (msg.forward_from || msg.video && !msg.caption?.startsWith('/')) {
    const user = await getUser(msg);
    
    if (user && user.state !== '') {
      switch(user.state) {
        case 'videoAwaiting':
          await videoAwaiting(msg);
          break;
        case 'forwardExpertWaiting':
          await forwardExpertAwaiting(msg);
          break;
        case 'ideaAwaiting':
          await ideaAwaiting(msg);
          break;
        case 'difficultyAwaiting':
          await difficultyAwaiting(msg);
          break;
        case 'hashtagAwaiting':
          await hashtagAwaiting(msg);
          break;
        default:
          await bot.sendMessage(chatId, `Неизвестный user.state (${user.state})`); // исправить на проде
        break;
      }
    } else {
      await bot.sendMessage(chatId, 'К такому меня жизнь ещё не готовила.'); // исправить на проде
    }
  } else if (msg.text) {
    if (!msg.text.startsWith('/')) {
      await bot.sendMessage(chatId, 'Я не такой умный, чтобы понимать обычный текст'); // исправить на проде
    } else {
      const cmd = msg.text.split(' ')[0].substring(1);
      switch (cmd) {
        case 'start':
          await command.start(msg);
          break;
        case 'home':
          await command.home(msg);
          break;
        case 'help':
          await command.help(msg);
          break;
        case 'expert':
          await command.expert(msg);
          break;
        default:
          await bot.sendMessage(chatId, 'Я не знаю такую команду');
          break;
      }
    }
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':')[0];
  const action = callbackQuery.data.split(':')[1];

  try {
    await bot.answerCallbackQuery(callbackQuery.id);
    await updateUserState(chatId, '');

    switch (data) {
      case 'home':
        await callback.home(callbackQuery);
        break;
      case 'sendVideo':
        await callback.sendVideo(callbackQuery);
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
      default:
        console.log(`Неизвестный callback_data_query: ${data}`);
        await bot.sendMessage(chatId, `Неизвестный callback_data_query: ${data}`);
        break;
    }
  } catch (error) {
    console.error(`Ошибка при получении callbackQuery ${data}:`, error);
  }
});