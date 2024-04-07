const bot = require('./bot');
const buttons = require('./buttons');
const { getUser, getUsers, upsertUser, updateUserState } = require('../db/userService');
const { createVideo } = require('../db/videoService');

const videoAwaiting = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    if (msg.video) {
      await createVideo(msg);
      await updateUserState(chatId, '');

      const message = 'Спасибо, я отправил ваш ролик эксперту. Как только он ответит, я пришлю вам ответ.';
      const options = buttons.goHome;
      await bot.sendMessage(chatId, message, options);

      const experts = await getUsers({ isExpert: true });
      if (experts.length) {
        for (const expert of experts) {
          await bot.sendMessage(expert.chatId, 'Поступил новый ролик!');
        }
      }
    } else {
      await bot.sendMessage(chatId, 'Пожалуйста, отправьте ролик.');
    }
  } catch (error) {
    console.error('Не удалось принять видео', error)
  }
}

const forwardExpertWaiting = async (msg) => {
  const chatId = msg.chat.id;

  if (msg.forward_from && !msg.forward_from.is_bot) {
    try {
      let message;
      const foundUser = await getUser(msg.forward_from.id);
      if (foundUser && foundUser.isExpert) {
        const fwdUser = await upsertUser(msg, { isExpert: false });
        const name = !!fwdUser.username ? `@${fwdUser.username}` : !!fwdUser.firstName ? fwdUser.firstName : `с ID ${fwdUser.chatId}`;
        message = `Пользователь ${name} разжалован!`
      } else {
        const fwdUser = await upsertUser(msg, { isExpert: true });
        const name = !!fwdUser.username ? `@${fwdUser.username}` : !!fwdUser.firstName ? fwdUser.firstName : `с ID ${fwdUser.chatId}`;
        message = `Пользователь ${name} стал экспертом!`
      }
      const options = buttons.goHome;
      await updateUserState(chatId, '');
      await bot.sendMessage(chatId, message, options);
    } catch (error) {
      console.log('Не удалось сделать пользователя экспертом или разжаловать его:', error)
    }
  } else {
    await bot.sendMessage(chatId, 'Перешлите мне сообщение другого пользователя, которого хотите сделать экспертом или разжаловать.');
  }
}

module.exports = {
  videoAwaiting,
  forwardExpertWaiting,
}