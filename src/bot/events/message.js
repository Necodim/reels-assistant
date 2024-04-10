const bot = require('../bot');
const command = require('../handlers/commandHandlers');
const { videoAwaiting, forwardExpertAwaiting, ideaAwaiting } = require('../handlers/messageHandlers');
const { getUser } = require('../../db/service/userService');

module.exports = async (msg) => {
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
        case 'snezone':
          await command.snezone(msg);
          break;
        case 'test':
          await command.test(msg);
          break;
        default:
          await bot.sendMessage(chatId, 'Я не знаю такую команду');
          break;
      }
    }
  }
}