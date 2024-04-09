require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const message = require('./events/message');
const callback = require('./events/callback');

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

module.exports = bot;