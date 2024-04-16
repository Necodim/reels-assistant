const bot = require("../bot/bot");
const buttons = require("../bot/helpers/buttons");
const { getUsersForVideoReminder, getUsers } = require("../db/service/userService");
const { getRandomElement } = require("../helpers/getRandom");
const { toVideoReminder } = require("./messages");

const sendEverydayReminder = async () => {
  const options = buttons.home('getIdea');
  
  try {
    const users = await getUsers({ isExpert: false });
    users.forEach(async (user) => {
      const message = 'Эй, псс... У меня тут кое-что есть для тебя! Появились новые идеи для рилс 🤩';
      await bot.sendMessage(user.chatId, message, options);
    });
  } catch (error) {
    console.error('Не удалось отправить напоминание об отправке видео:', error);
  }
}

const sendVideoReminder = async () => {
  const options = buttons.home('sendVideo');
  
  try {
    const users = await getUsersForVideoReminder();
    users.forEach(async (user) => {
      const message = getRandomElement(toVideoReminder);
      await bot.sendMessage(user.chatId, message, options);
    });
  } catch (error) {
    console.error('Не удалось отправить напоминание об отправке видео:', error);
  }
}

module.exports = {
  sendEverydayReminder,
  sendVideoReminder,
}