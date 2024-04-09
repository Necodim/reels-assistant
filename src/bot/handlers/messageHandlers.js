const bot = require('../bot');
const buttons = require('../helpers/buttons');
const { getUsers, upsertUser, updateUserState } = require('../../db/service/userService');
const { createVideo } = require('../../db/service/videoService');
const { createIdea } = require('../../db/service/ideaService');
const { difficulty, hashtag } = require('./callbackHandlers');

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
      const foundUser = await getUserByChatId(msg.forward_from.id);
      if (foundUser && foundUser.isExpert) {
        const fwdUser = await upsertUser(msg, { isExpert: false });
        const name = !!fwdUser.username ? `@${fwdUser.username}` : !!fwdUser.firstName ? fwdUser.firstName : `с ID ${fwdUser.chatId}`;
        message = `Пользователь ${name} разжалован!`
        await bot.sendMessage(fwdUser.chatId, 'Роль изменена с эксперта на пользователя 🥲', buttons.mainMenu.user);
      } else {
        const fwdUser = await upsertUser(msg, { isExpert: true });
        const name = !!fwdUser.username ? `@${fwdUser.username}` : !!fwdUser.firstName ? fwdUser.firstName : `с ID ${fwdUser.chatId}`;
        message = `Пользователь ${name} стал экспертом!`
        await bot.sendMessage(fwdUser.chatId, 'Роль изменена с пользователя на эксперта 🥳', buttons.mainMenu.expert);
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
  console.log(msg)
  const chatId = msg.chat.id;
  const message = 'Отлично. Укажите, насколько сложно снять такой ролик, где 1 – очень просто, а 3 – очень сложно:';

  try {
    if (!msg.video && !msg.caption) {
      await bot.sendMessage(chatId, 'Необходимо прислать ролик (не файлом) с описанием.');
    } else if (!msg.video) {
      await bot.sendMessage(chatId, 'Вы не прислали ролик. Необходимо прислать ролик (не файлом) с описанием.');
    } else if (msg.video && !msg.caption) {
      await bot.sendMessage(chatId, 'Вы не добавили описание. Необходимо прислать ролик (не файлом) с описанием.');
    } else if (msg.video && msg.caption) {
      const idea = await createIdea(msg);

      const options = buttons.difficulty(idea.id);

      await updateUserState(chatId, 'difficultyAwaiting');
      await bot.sendMessage(chatId, message, options);
    } else {
      await bot.sendMessage(chatId, 'Что-то я ничего не понял. Необходимо прислать ролик (не файлом) с описанием.');
    }
  } catch (error) {
    console.error('Не удалось принять видео:', error)
  }
}

const difficultyAwaiting = async (msg) => {
  await difficulty(msg);
}

const hashtagAwaiting = async (msg) => {
  await hashtag(msg);
}

module.exports = {
  videoAwaiting,
  forwardExpertAwaiting,
  ideaAwaiting,
  difficultyAwaiting,
  hashtagAwaiting,
}