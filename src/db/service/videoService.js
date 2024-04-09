const Video = require('../models/videoModel');
const Idea = require('../models/ideaModel');
const User = require('../models/userModel');

const getVideo = async (id) => {
  try {
    let video = await Video.findOne({ videoId: id });
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

const updateVideo = async (videoId, updateData) => {
  try {
    // Поиск видео по videoId и его обновление
    const updatedVideo = await Video.findOneAndUpdate(
      { videoId: videoId },
      { $set: updateData },
      { new: true } // Возвращает обновленный документ
    );

    if (updatedVideo) {
      console.log('Видео обновлено успешно:', updatedVideo);
      return updatedVideo;
    } else {
      throw new Error('Видео не найдено');
    }
  } catch (error) {
    console.error('Ошибка при обновлении видео в БД:', error);
    throw error;
  }
}

module.exports = {
  getVideo,
  createVideo,
  updateVideo,
};