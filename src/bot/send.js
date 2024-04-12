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

Автор: @${user.username}
#идея`

    const topicId = user.groupTopicId ? user.groupTopicId : group.ideas;
    const options = {...btns, caption, message_thread_id: topicId};
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
<blockquote>${video.evaluation}</blockquote>
#оценка`;

    const topicId = user.groupTopicId ? user.groupTopicId : group.answers;
    const options = {caption: caption, message_thread_id: topicId, parse_mode: 'HTML'};
    await sendVideoToBot(group.id, video.videoId, options);
  } catch (error) {
    console.error('Не удалось отправить оценку эксперта в группу:', error);
  }
}

const createForumTopic = async (name) => {
  try {
    const topic = await bot.createForumTopic(group.id, name);
    return topic;
  } catch (error) {
    console.error('Не удалось создать ветку в группе:', error);
  }
}

const editForumTopic = async (topicId, name) => {
  const options = {
    name: name
  }

  try {
    const topic = await bot.editForumTopic(group.id, topicId, options);
    return topic;
  } catch (error) {
    console.error('Не удалось изменить ветку в группе:', error);
  }
}

const closeForumTopic = async (topicId) => {
  try {
    const topic = await bot.closeForumTopic(group.id, topicId);
    return topic;
  } catch (error) {
    console.error('Не удалось закрыть ветку в группе:', error);
  }
}

const reopenForumTopic = async (topicId) => {
  try {
    const topic = await bot.reopenForumTopic(group.id, topicId);
    return topic;
  } catch (error) {
    console.error('Не удалось открыть ветку в группе:', error);
  }
}

module.exports = {
  sendVideoToBot,
  sendIdeaOutside,
  sendAnswerOutside,
  createForumTopic,
  editForumTopic,
  closeForumTopic,
  reopenForumTopic,
}