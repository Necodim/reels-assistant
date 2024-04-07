const bot = require('./bot');
const command = require('./commandHandlers');
const callback = require('./callbackHandlers');
const { videoAwaiting } = require('./messageHandlers');
const { User } = require('../db/index');

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (!msg.text.startsWith('/')) {
    const user = await User.findOne({ chatId: chatId });
    
    if (user && user.state !== '') {
      switch(user.state) {
        case 'videoAwaiting':
          await videoAwaiting(msg);
          break;
        default:
          await bot.sendMessage(chatId, `Неизвестный user.state (${user.state})`); // исправить на проде
        break;
      }
    } else {
      await bot.sendMessage(chatId, 'К такому меня жизнь ещё не готовила.'); // исправить на проде
    }
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
});

bot.on('callback_query', async (callbackQuery) => {
  const data = callbackQuery.data;
  try {
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Секундочку...' });

    switch (data) {
      case 'home':
        await callback.home(callbackQuery);
        break;
      case 'send_video':
        await callback.send_video(callbackQuery);
        break;
      default:
        console.log(`Неизвестный callback_data_query: ${data}`);
        await bot.sendMessage(chatId, `Неизвестный callback_data_query: ${data}`);
        break;
    }
  } catch (error) {
    console.error(`Ошибка при получении callbackQuery ${data}:`, error);
  }
});