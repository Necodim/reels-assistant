const Video = require('./videoModel');
const User = require('./userModel');

const getVideo = async (id) => {
  try {
    let video = await User.findOne({ videoId: id });
    return video;
  } catch (error) {
    console.error(`Видео с ID ${id} не найдено:`, error);
    throw error;
  }
}

const createVideo = async (msg) => {
  try {
    let user = await User.findOne({ chatId: msg.chat.id });
    if (user) {
      const newVideo = new Video({
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
    console.error('Ошибка при создании нового видео в БД:', error);
    throw error;
  }
}

module.exports = {
  getVideo,
  createVideo,
};