const bot = require('./bot');
const buttons = require('./buttons');
const { getUser, getUsers, upsertUser, updateUserState } = require('../db/userService');
const { createVideo } = require('../db/videoService');
const { createIdea } = require('../db/ideaService');

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
    console.error('Не удалось принять видео:', error)
  }
}

const forwardExpertAwaiting = async (msg) => {
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

const ideaAwaiting = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Отлично. Укажите, насколько сложно снять такой ролик, где 1 – очень просто, а 3 – очень сложно:';

  try {
    if (msg.video && msg.caption) {
      const idea = await createIdea(msg);

      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '1', callback_data: `difficulty:1:${idea.videId}` },
              { text: '2', callback_data: `difficulty:2:${idea.videId}` },
              { text: '3', callback_data: `difficulty:3:${idea.videId}` }
            ],
          ]
        }
      };

      await updateUserState(chatId, 'difficultyAwaiting');
      await bot.sendMessage(chatId, message, options);
    } else {
      await bot.sendMessage(chatId, 'Пожалуйста, пришлите ролик с описанием.');
    }
  } catch (error) {
    console.error('Не удалось принять видео:', error)
  }
}

module.exports = {
  videoAwaiting,
  forwardExpertAwaiting,
  ideaAwaiting,
}