const bot = require('./bot');
const buttons = require('./buttons');
const { getIdea } = require('../db/ideaService');
const { getUserById } = require('../db/userService');

const channelId = -1002102561296;

const sendIdeaToChannel = async (ideaId) => {
  try {
    const idea = await getIdea(ideaId);
    console.log(idea)
    const user = await getUserById(idea.userId);
    console.log(user)

    const caption = `${idea.caption}

Сложность: ${idea.difficulty}
${idea.hashtag}

Автор: @${user.username}`

    const options = {...buttons.channel.delete, caption};
    await sendVideo(channelId, ideaId, options);
  } catch (error) {
    console.error('Не удалось отправить идею в канал:', error);
  }
}

module.exports = {
  sendIdeaToChannel,
}