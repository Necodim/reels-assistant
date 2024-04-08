const bot = require('./bot');

const sendVideo = async (chatId, videoId, options = {caption: ''}) => {
  try {
    await bot.sendVideo(chatId, videoId, options);
    console.log(`Видео ${videoId} успешно отправлено`);
  } catch (error) {
    console.error(`Ошибка при отправке видео ${videoId}:`, error);
  }
};

module.exports = {
  sendVideo,
}