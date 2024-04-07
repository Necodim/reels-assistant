const bot = require('./bot');

const videoAwaiting = async (msg) => {
  const chatId = msg.chat.id;

  if (msg.video) {
    console.log(msg.video);
    const message = 'Спасибо, я отправил ваш ролик эксперту. Как только он ответит, я пришлю вам ответ.';
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Главное меню', callback_data: 'home' }],
        ]
      }
    }
    await bot.sendMessage(chatId, message, options);
    await updateUserState(chatId, '');
  } else {
    await bot.sendMessage(chatId, 'Пожалуйста, отправьте ролик.');
  }
}

module.exports = {
  videoAwaiting,
}