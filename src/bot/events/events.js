const bot = require('../bot');
const message = require('./message');
const callback = require('./callback');

bot.on('message', async (msg) => {
  try {
    await message(msg);
  } catch (error) {
    console.log(msg);
    console.error('message error:', error);
  }
});

bot.on('callback_query', async (callbackQuery) => {
  try {
    await callback(callbackQuery);
  } catch (error) {
    console.log(callbackQuery);
    console.error('callbackQuery error:', error);
  }
});