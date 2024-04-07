const bot = require('./bot');
const { updateUserState } = require('../db/userService');

async function home(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    try {
        await updateUserState(chatId, '');
        await bot.sendMessage(chatId, 'Прикрепите ролик и напишите сопроводительное сообщение, если необходимо.');
    } catch (error) {
        console.error(error);
    }
}

async function send_video(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    try {
        await updateUserState(chatId, 'videoAwaiting');
        await bot.sendMessage(chatId, 'Прикрепите ролик и напишите сопроводительное сообщение, если необходимо.');
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    home,
    send_video,
};
