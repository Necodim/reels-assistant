const bot = require('../bot');
const { adminUsers } = require('../helpers/admin');
const buttons = require('../helpers/buttons');
const { getUser, upsertUser, updateUserState } = require('../../db/service/userService');
const { createForumTopic, reopenForumTopic, closeForumTopic } = require('../send');

const start = async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const disclaimerMessage = '<i>В данном боте вы можете встретить упоминания или понятия, связанные с компанией Meta. Компания Meta Platforms Inc. признана экстремистской организацией и запрещена в Российской Федерации. Принадлежащие ей соцсети Facebook и Instagram также запрещены.</i>'
    await bot.sendMessage(chatId, disclaimerMessage, { parse_mode: 'HTML' });

    const user = await upsertUser(msg);
    await updateUserState(chatId, '');
    let message, options = {};
    if (user.isExpert) {
      const topicName = user.username ? user.username : user.firstName + ` ${user.lastName}`;
      const topicId = user.groupTopicId;
      const topic = !!topicId ? await reopenForumTopic(topicId, topicName) : await createForumTopic(topicName);
      await upsertUser(msg, { groupTopicId: topic.message_thread_id });

      message = 'Вы можете опубликовывать идеи и оценивать ролики подопечных. Управление функционалом бота происходит через кнопки под сообщениями.'
      if (!user.about) {
        await updateUserState(chatId, 'aboutAwaiting');
        message += `

Но для начала расскажи о себе. Этот текст пользователь увидит, когда оформит подписку и станет вашим подопечным.`;
      } else {
        options = buttons.mainMenu('expert');
      }
    } else {
      if (!!user.groupTopicId) {
        await closeForumTopic(user.groupTopicId);
      }
      message = 'Добро пожаловать в инструмент для взаимодействия экспертов-рилсмэйкеров и блогеров. Вы можете бесплатно просматривать идеи экспертов и тут же их реализовывать, а также получать фидбэк на ваши посты. Для этого воспользуйтесь кнопками ниже:';
      options = buttons.mainMenu('user');
    }
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при получении / создании / обновлении пользователя в БД или при отправке ответа на команду /start:', error);
  }
};

const home = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Главное меню';

  try {
    const user = await getUser(msg);
    await updateUserState(chatId, '');
    const options = user.isExpert ? buttons.mainMenu('expert') : buttons.mainMenu('user');
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при отправке ответа на команду /home:', error);
  }
};

const help = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Если у вас есть какие-то вопросы или вы хотите стать экспертом, напишите @snezone.';
  try {
    await updateUserState(chatId, '');
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Ошибка при отправке ответа на команду /help', error);
  }
};

const expert = async (msg) => {
  const chatId = msg.chat.id;
  const options = buttons.home();
  try {
    await updateUserState(chatId, 'forwardExpertWaiting');
    let message;
    if (adminUsers.map(user => user.id).indexOf(chatId) !== -1) {
      message = 'Перешлите мне любое сообщение пользователя, которого вы хотите сделать экспертом или разжаловать.';
    } else {
      message = 'Вам не доступен этот функционал.';
    }
    await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Ошибка при отправке ответа на команду /expert', error);
  }
};

const send = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Я могу отправить сообщение от своего имени пользователяю. Кому вы хотите отправить сообщение? Напишите его никнейм в виде: @snezone';
  const options = {reply_parameters: {message_id: msg.message_id}, reply_markup: {inline_keyboard: [buttons.homeButton], force_reply: true, input_field_placeholder: '@username'}};

  if (adminUsers.map(user => user.id).indexOf(chatId) !== -1) {
    try {
      await updateUserState(chatId, 'awaitUsernameToSendMessage')
      await bot.sendMessage(chatId, message, options);
    } catch (error) {
      console.log('/test error:', error)
    }
  }
};

const snezone = async (msg) => {
  const chatId = msg.chat.id;
  const options = buttons.home();

  if (adminUsers.map(user => user.id).indexOf(chatId) !== -1) {
    try {
      const user = await getUser(msg);
      const message = `Ваша роль изменена. Теперь вы ${user.isExpert ? 'обычный пользователь' : 'эксперт'}!`;
      if (user && user.isExpert) {
        if (!!user.groupTopicId) {
          await closeForumTopic(user.groupTopicId);
        }
        await upsertUser(msg, { isExpert: false });
      } else {
        const topicName = user.username ? user.username : user.firstName + ` ${user.lastName}`;
        const topicId = user.groupTopicId;
        const topic = !!topicId ? await reopenForumTopic(topicId, topicName) : await createForumTopic(topicName);

        await upsertUser(msg, { isExpert: true, groupTopicId: topic.message_thread_id });
      }
      await updateUserState(chatId, '');
      await bot.sendMessage(chatId, message, options);
    } catch (error) {
      console.log('Не удалось сделать пользователя экспертом или разжаловать его:', error)
    }
  }
};

const test = async (msg) => {
  const chatId = msg.chat.id;
  const message = 'Тест';
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Тест', callback_data: 'test' }],
        [{ text: '🏠 Главное меню', callback_data: 'home' }],
      ]
    }
  };

  if (adminUsers.map(user => user.id).indexOf(chatId) !== -1) {
    try {
      await bot.sendMessage(chatId, message, options);
    } catch (error) {
      console.log('/test error:', error)
    }
  }
};

module.exports = {
  start,
  home,
  help,
  expert,
  send,
  snezone,
  test,
};