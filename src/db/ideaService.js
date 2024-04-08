const Idea = require('./ideaModel');
const User = require('./userModel');

const getIdea = async (id) => {
  try {
    let idea = await User.findOne({ videoId: id });
    return idea;
  } catch (error) {
    console.error(`Идея с ID ${id} не найдена:`, error);
    throw error;
  }
}

const createIdea = async (msg) => {
  try {
    let user = await User.findOne({ chatId: msg.chat.id });
    if (user) {
      const newVideo = new Idea({
        userId: user.id,
        chatId: msg.chat.id,
        videoId: msg.video.file_id,
        caption: msg.caption || ''
      });
      await newVideo.save();
      return newVideo;
    } else {
      throw Error;
    }
  } catch (error) {
    console.error('Ошибка при создании новой идеи в БД:', error);
    throw error;
  }
}

module.exports = {
  getIdea,
  createIdea,
};