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
  const options = buttons.difficulty;

  try {
    if (msg.video && msg.caption) {
      await createIdea(msg);
      await updateUserState(chatId, 'difficultyAwaiting');
      
      await bot.sendMessage(chatId, message, options);
    } else {
      await bot.sendMessage(chatId, 'Пожалуйста, пришлите ролик с описанием.');
    }
  } catch (error) {
    console.error('Не удалось принять видео:', error)
  }
}

// передать ID идеи, чтобы внести туда сложность
const difficultyAwaiting = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Спасибо, я сохранил вашу идею. Теперь выберите хэштег:';
  const options = buttons.hashtags;
  
  try {
    await updateUserState(chatId, 'hashtagAwaiting');
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Не удалось записать сложность съёмки:', error)
  }
}

// передать ID идеи, чтобы внести туда хэштег
const hashtagAwaiting = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Хэштег записан, идея добавлена.';
  const options = buttons.goHome;

  try {
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Не удалось записать хэшетег:', error)
  }
}

module.exports = {
  videoAwaiting,
  forwardExpertAwaiting,
  ideaAwaiting,
  difficultyAwaiting,
  hashtagAwaiting,
}