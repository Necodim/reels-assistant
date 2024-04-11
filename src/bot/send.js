const bot = require('./bot');
const buttons = require('./helpers/buttons');
const { getIdeaById } = require('../db/service/ideaService');
const { getUserById } = require('../db/service/userService');
const { getVideoById } = require('../db/service/videoService');

const channelId = -1002102561296;
const group = {
  id: -1001950946438,
  ideas: 2,
  answers: 3,
}

const sendVideoToBot = async (chatId, videoId, options = {caption: ''}) => {
  try {
    const botMessage = await bot.sendVideo(chatId, videoId, options);
    return botMessage;
  } catch (error) {
    console.error(`Ошибка при отправке видео ${videoId}:`, error);
  }
};

const sendIdeaOutside = async (ideaId, btns = {}) => {
  try {
    const idea = await getIdeaById(ideaId);
    const user = await getUserById(idea.userId);

    const caption = `${idea.caption}

Сложность: ${idea.difficulty}
${idea.hashtag}

Автор: @${user.username}`

    const options = {...btns, caption, message_thread_id: group.ideas};
    await sendVideoToBot(group.id, idea.videoId, options);
  } catch (error) {
    console.error('Не удалось отправить идею в группу:', error);
  }
}

const sendAnswerOutside = async (videoId) => {
  try {
    const video = await getVideoById(videoId);
    const user = await getUserById(video.evaluatedBy);

    const caption = `Запрос пользователя:
<blockquote>${video.caption}</blockquote>

Ответ от @${user.username}:
<blockquote>${video.evaluation}</blockquote>`;

    const options = {caption: caption, message_thread_id: group.ideas, parse_mode: 'HTML'};
    await sendVideoToBot(group.id, video.videoId, options);
  } catch (error) {
    console.error('Не удалось отправить оценку эксперта в группу:', error);
  }
}

module.exports = {
  sendVideoToBot,
  sendIdeaOutside,
  sendAnswerOutside,
}