const bot = require('./bot');
const buttons = require('./buttons');
const { getIdeaById } = require('../db/ideaService');
const { getUserById } = require('../db/userService');
const { sendVideo } = require('./callbackHandlers');

const channelId = -1002102561296;

const sendIdeaToChannel = async (ideaId) => {
  try {
    const idea = await getIdeaById(ideaId);
    const user = await getUserById(idea.userId);

    const caption = `${idea.caption}

Сложность: ${idea.difficulty}
${idea.hashtag}

Автор: @${user.username}`

    const options = {...buttons.channel.delete, caption};
    await sendVideo(channelId, idea.videoId, options);
  } catch (error) {
    console.error('Не удалось отправить идею в канал:', error);
  }
}

module.exports = {
  sendIdeaToChannel,
}