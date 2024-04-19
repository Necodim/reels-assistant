const bot = require('../bot');
const buttons = require('../helpers/buttons');
const { getUserByChatId, getUsers, upsertUser, updateUserState, getUserById } = require('../../db/service/userService');
const { createVideo, updateVideoById, findUnreviewedVideosByExpert } = require('../../db/service/videoService');
const { createIdea } = require('../../db/service/ideaService');
const { difficulty, hashtag } = require('./callbackHandlers');
const { createForumTopic, reopenForumTopic, closeForumTopic } = require('../send');

const videoAwaiting = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    if (msg.video) {
      const video = await createVideo(msg);
      await updateUserState(chatId, '');

      const message = 'Спасибо, я отправил ваш ролик эксперту. Как только он ответит, я пришлю вам ответ.';
      const options = buttons.home('sendYetVideo');
      await bot.sendMessage(chatId, message, options);

      const expert = await getUserById(video.expertId);
      const expertMessage = 'Поступил новый ролик на оценку!';
      const expertOptions = buttons.home('evaluateVideo');
      await bot.sendMessage(expert.chatId, expertMessage, expertOptions);
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
      const user = await getUserByChatId(msg.forward_from.id);
      if (user && user.isExpert) {
        if (!!user.groupTopicId) {
          await closeForumTopic(user.groupTopicId);
        }

        const fwdUser = await upsertUser(msg, { isExpert: false });
        const name = !!fwdUser.username ? `@${fwdUser.username}` : !!fwdUser.firstName ? fwdUser.firstName : `с ID ${fwdUser.chatId}`;
        message = `Пользователь ${name} разжалован!`
        await bot.sendMessage(fwdUser.chatId, 'Роль изменена с эксперта на пользователя 🥲', buttons.mainMenu('user'));
      } else {
        const topicName = user.username ? user.username : user.firstName + ` ${user.lastName}`;
        const topicId = user.groupTopicId;
        const topic = !!topicId ? await reopenForumTopic(topicId, topicName) : await createForumTopic(topicName);

        const fwdUser = await upsertUser(msg, { isExpert: true, groupTopicId: topic.message_thread_id });
        const name = !!fwdUser.username ? `@${fwdUser.username}` : !!fwdUser.firstName ? fwdUser.firstName : `с ID ${fwdUser.chatId}`;
        message = `Пользователь ${name} стал экспертом!`
        await bot.sendMessage(fwdUser.chatId, 'Роль изменена с пользователя на эксперта 🥳', buttons.mainMenu('expert'));
      }
      const options = buttons.home();
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
    if (!msg.video && !msg.caption) {
      await bot.sendMessage(chatId, 'Необходимо прислать ролик (не файлом) с описанием.');
    } else if (!msg.video) {
      await bot.sendMessage(chatId, 'Вы не прислали ролик. Необходимо прислать ролик (не файлом) с описанием.');
    } else if (msg.video && !msg.caption) {
      await bot.sendMessage(chatId, 'Вы не добавили описание. Необходимо прислать ролик (не файлом) с описанием.');
    } else if (msg.video && msg.caption) {
      const idea = await createIdea(msg);

      const options = buttons.difficulty(idea._id);

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

const evaluateAwaiting = async (msg, state) => {
  const videoId = state.split(':')[1];
  const chatId = msg.chat.id;
  const text = msg.text;
  const message = `<b>Ваша оценка</b>
<blockquote>${text}</blockquote>

Отправляю эту оценку пользователю?`
  const options = {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📝 Нет, изменить', callback_data: `evalt:edit:${videoId}` }],
        [{ text: '✉️ Отправить', callback_data: `evalt:send:${videoId}` }],
      ]
    }
  }

  try {
    const user = await getUserByChatId(chatId);
    const updateData = {
      isEvaluated: true,
      evaluation: text,
      evaluatedBy: user._id
    }
    await updateVideoById(videoId, updateData);
    await updateUserState(chatId, '');
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Не удалось начать оценку экспертом ролика пользователя:', error)
  }
}

const aboutAwaiting = async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const message1 = `Отлично, вот ваша информация «Обо мне»:
<blockquote>${text}</blockquote>
Изменить её можно в соответствующем разделе в ⚙️ Настройках.`
  const options1 = {parse_mode: 'HTML'};
  const options2 = {...buttons.mainMenu('expert')};

  try {
    const user = await upsertUser(msg, { about: text });
    await updateUserState(chatId, '');
    await bot.sendMessage(chatId, message1, options1);
    await bot.sendChatAction(chatId, 'typing');
    const videos = findUnreviewedVideosByExpert(user._id);
    let message2 = 'А теперь можете начать генерить идеи. Как только у вас появится новый подписчик, я сообщу об этом!'
    if (videos.length) {
      message2 += ` Кстати, у вас есть неоценённые ролики (${videos.length} шт.) 👏`;
    } else {
      message2 += ' Если подписчик пришлёт вам ролик на оценку, я также обязательно пришлю вам уведомление 🫡';
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    await bot.sendMessage(chatId, message2, options2);
  } catch (error) {
    console.error('Не удалось записать информацию об эксперте:', error)
  }
}

const awaitUsernameToSendMessage = async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.text;
  const isUsername = /^@[a-zA-Z\d_]{5,32}$/gi.test(username);
  const state = isUsername ? 'awaitMessageToSendMessage' : 'awaitUsernameToSendMessage';
  const message = isUsername ? `Отлично! Я отправлю сообщение пользователю ${username}, с этим определились. Теперь пришлите мне сообщение, которое необходимо отправить. Это может быть как просто текст, так и видео с описание, изображение или что-то ещё.` : 'Пришлите, пожалуйста никнейм пользователя, которому хотите отправить сообщение, в виде: @username';
  const options = isUsername ? {reply_parameters: {message_id: msg.message_id}, reply_markup: {inline_keyboard: [buttons.homeButton], force_reply: true, input_field_placeholder: `Ваше сообщение пользователю ${username}`}} : buttons.home();

  try {
    await updateUserState(chatId, state);
    const botMessage = await bot.sendMessage(chatId, message, options);
    console.log(botMessage)
  } catch (error) {
    console.error('Не удалось принять никнейм пользователя, которому будет отправлено сообщение:', error)
  }
}

const awaitMessageToSendMessage = async (msg) => {
  const chatId = msg.chat.id;
  console.log(msg)
  const message = 'Спасибо. Пока тестирую, ничего никуда не отправилось.'
  const options = {reply_parameters: {message_id: msg.message_id}, reply_markup: {inline_keyboard: [[{ text: '✉️ Да, отправить', callback_data: `send2:${username}` }], buttons.homeButton], force_reply: false}};

  try {
    await updateUserState(chatId, '');
    const botMessage = await bot.sendMessage(chatId, message, options);
    console.log(botMessage)
  } catch (error) {
    console.error('Не удалось принять сообщение для пользователя:', error)
  }
}

module.exports = {
  videoAwaiting,
  forwardExpertAwaiting,
  ideaAwaiting,
  difficultyAwaiting,
  hashtagAwaiting,
  evaluateAwaiting,
  aboutAwaiting,
  awaitUsernameToSendMessage,
  awaitMessageToSendMessage,
}