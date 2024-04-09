const bot = require('./bot');
const buttons = require('./helpers/buttons');
const { getIdeaById } = require('../db/service/ideaService');
const { getUserById } = require('../db/service/userService');

const channelId = -1002102561296;

const sendVideo = async (chatId, videoId, options = {caption: ''}) => {
  try {
    await bot.sendVideo(chatId, videoId, options);
    console.log(`Видео ${videoId} успешно отправлено`);
  } catch (error) {
    console.error(`Ошибка при отправке видео ${videoId}:`, error);
  }
};

const sendIdeaToChannel = async (ideaId) => {
  try {
    const idea = await getIdeaById(ideaId);
    const user = await getUserById(idea.userId);

    const btns = buttons.channel.delete(ideaId);
    const caption = `${idea.caption}

Сложность: ${idea.difficulty}
${idea.hashtag}

Автор: @${user.username}`

    const options = {...btns, caption};
    await sendVideo(channelId, idea.videoId, options);
  } catch (error) {
    console.error('Не удалось отправить идею в канал:', error);
  }
}

module.exports = {
  sendVideo,
  sendIdeaToChannel,
}