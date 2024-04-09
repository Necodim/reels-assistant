const bot = require('./bot');
const buttons = require('./helpers/buttons');
const { getIdeaById } = require('../db/service/ideaService');
const { getUserById } = require('../db/service/userService');

const channelId = -1002102561296;

const sendVideoToBot = async (chatId, videoId, options = {caption: ''}) => {
  try {
    await bot.sendVideo(chatId, videoId, options);
    console.log(`Видео ${videoId} успешно отправлено`);
  } catch (error) {
    console.error(`Ошибка при отправке видео ${videoId}:`, error);
  }
};

const sendIdeaToBot = async (chatId, ideaId, btns = {}) => {
  console.log('btns:', JSON.stringify(btns));
  try {
    const idea = await getIdeaById(ideaId);
    console.log('idea:', idea);

    const caption = `${idea.caption}

Сложность: ${idea.difficulty}
${idea.hashtag}`
    console.log('caption:', caption);
    const options = {...btns, caption};
    console.log('options:', JSON.stringify(options));
    await sendVideoToBot(chatId, idea.videoId, options);
  } catch (error) {
    console.error(`Не удалось отправить идею пользователю ${chatId} в бот:`, error);
  }
}

const sendIdeaToChannel = async (ideaId, btns = {}) => {
  try {
    const idea = await getIdeaById(ideaId);
    const user = await getUserById(idea.userId);

    const caption = `${idea.caption}

Сложность: ${idea.difficulty}
${idea.hashtag}

Автор: @${user.username}`

    const options = {...btns, caption};
    await sendVideoToBot(channelId, idea.videoId, options);
  } catch (error) {
    console.error('Не удалось отправить идею в канал:', error);
  }
}

module.exports = {
  sendIdeaToBot,
  sendIdeaToChannel,
}