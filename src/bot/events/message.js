const bot = require('../bot');
const command = require('../handlers/commandHandlers');
const state = require('../handlers/stateHandlers');
const { getUser } = require('../../db/service/userService');

const checkUserState = async (msg) => {
  const chatId = msg.chat.id;
  const user = await getUser(msg);

  if (user && user.state !== '') {
    const stateData = user.state.split(':')[0];
    switch (stateData) {
      case 'videoAwaiting':
        await state.videoAwaiting(msg);
        break;
      case 'forwardExpertWaiting':
        await state.forwardExpertAwaiting(msg);
        break;
      case 'ideaAwaiting':
        await state.ideaAwaiting(msg);
        break;
      case 'difficultyAwaiting':
        await state.difficultyAwaiting(msg);
        break;
      case 'hashtagAwaiting':
        await state.hashtagAwaiting(msg);
        break;
      case 'evaluateAwaiting':
        await state.evaluateAwaiting(msg, user.state);
        break;
      case 'aboutAwaiting':
        await state.aboutAwaiting(msg);
        break;
      case 'awaitUsernameToSendMessage':
        await state.awaitUsernameToSendMessage(msg);
        break;
      case 'awaitMessageToSendMessage':
        await state.awaitMessageToSendMessage(msg);
        break;
      default:
        await bot.sendMessage(chatId, `Неизвестный user.state (${user.state})`); // исправить на проде
        break;
    }
  } else {
    await bot.sendMessage(chatId, 'К такому меня жизнь ещё не готовила.'); // исправить на проде
  }
}

const checkCommand = async (msg) => {
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
    case 'send':
      await command.send(msg);
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

module.exports = async (msg) => {
  const chatId = msg.chat.id;
  // console.log(msg)

  if (msg.forward_from || msg.video && !msg.caption?.startsWith('/')) {
    await checkUserState(msg);
  } else if (msg.text) {
    if (!msg.text.startsWith('/')) {
      await checkUserState(msg);
    } else {
      await checkCommand(msg);
    }
  }
}