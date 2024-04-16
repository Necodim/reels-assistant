const bot = require("../bot/bot");
const buttons = require("../bot/helpers/buttons");
const { findExpertsWithNoRecentIdeas } = require("../db/service/ideaService");
const { getUsersForVideoReminder, getUsers } = require("../db/service/userService");
const { getRandomElement } = require("../helpers/getRandom");
const userMessages = require("./messages/user");
const expertMessages = require("./messages/expert");
const { findUnreviewedVideoExperts } = require("../db/service/videoService");

const sendIdeaReminder = async () => {
  const options = {...buttons.home('createIdea'), parse_mode: 'HTML'};
  
  try {
    const users = await findExpertsWithNoRecentIdeas();
    if (users.length > 0) {
      users.forEach(async (user) => {
        const message = getRandomElement(expertMessages.everyday);;
        await bot.sendMessage(user.chatId, message, options);
      });
    }
  } catch (error) {
    console.error('Не удалось отправить напоминание об отправке видео:', error);
  }
}

const sendEvaluateIdeaReminder = async () => {
  const options = {...buttons.home('evaluateVideo'), parse_mode: 'HTML'};
  
  try {
    const users = await findUnreviewedVideoExperts();
    if (users.length > 0) {
      users.forEach(async (user) => {
        const message = getRandomElement(expertMessages.evaluateVideo);;
        await bot.sendMessage(user.chatId, message, options);
      });
    }
  } catch (error) {
    console.error('Не удалось отправить напоминание об отправке видео:', error);
  }
}

const sendEverydayReminder = async () => {
  const options = {...buttons.home('getIdea'), parse_mode: 'HTML'};
  
  try {
    const users = await getUsers({ isExpert: false });
    if (users.length > 0) {
      users.forEach(async (user) => {
        const message = getRandomElement(userMessages.everyday);;
        await bot.sendMessage(user.chatId, message, options);
      });
    }
  } catch (error) {
    console.error('Не удалось отправить напоминание об отправке видео:', error);
  }
}

const sendVideoReminder = async () => {
  const options = {...buttons.home('sendVideo'), parse_mode: 'HTML'};
  
  try {
    const users = await getUsersForVideoReminder();
    if (users.length > 0) {
      users.forEach(async (user) => {
        const message = getRandomElement(userMessages.createVideo);
        await bot.sendMessage(user.chatId, message, options);
      });
    }
  } catch (error) {
    console.error('Не удалось отправить напоминание об отправке видео:', error);
  }
}

module.exports = {
  sendIdeaReminder,
  sendEvaluateIdeaReminder,
  sendEverydayReminder,
  sendVideoReminder,
}