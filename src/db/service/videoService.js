const mongoose = require('mongoose');
const Video = require('../models/videoModel');
const User = require('../models/userModel');
const Subscription = require('../models/subscriptionModel');

const getVideo = async (videoId) => {
  try {
    let video = await Video.findOne({ videoId: videoId });
    return video;
  } catch (error) {
    console.error(`Видео с videoID ${videoId} не найдено:`, error);
    throw error;
  }
}

const getVideoById = async (id) => {
  try {
    let video = await Video.findById(id);
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
        userId: user._id,
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
    console.error('Ошибка при обновлении видео в БД по videoId:', error);
    throw error;
  }
}

const updateVideoById = async (id, updateData) => {
  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (updatedVideo) {
      console.log('Видео обновлено успешно:', updatedVideo);
      return updatedVideo;
    } else {
      throw new Error('Видео не найдено');
    }
  } catch (error) {
    console.error('Ошибка при обновлении видео в БД по id:', error);
    throw error;
  }
}

const setVideoEvaluateTo = async (id, boolean = false) => {
  try {
    const updateData = { isEvaluated: boolean };
    await updateVideoById(id, updateData);
  } catch (error) {
    console.error(`Не удалось изменить isEvaluated у видео ${id}:`, error);
    throw error;
  }
}

const getNextUnratedVideo = async (userId) => {
  try {
    const video = await Video.findOne({ isEvaluated: false, evaluation: '', evaluatedBy: userId }).sort({ createdAt: 1 });
    if (!video) {
      throw new Error('Новые видео для оценки не найдены');
    }
    return video;
  } catch (error) {
    console.error('Ошибка при поиске видео для оценки:', error);
    throw error;
  }
};

const findUnreviewedVideosByExpert = async (expertId) => {
  const currentDate = new Date();

  try {
    const expertObjectId = new mongoose.Types.ObjectId(expertId);
    const videos = await Video.find({ isEvaluated: false }).select('userId').lean();
    const userIds = videos.map(video => video.userId);

    const subscriptions = await Subscription.aggregate([
      {
        $match: {
          expertId: expertObjectId,
          userId: { $in: userIds },
          $or: [
            { status: 'Active' },
            { end: { $gte: currentDate } }
          ]
        }
      },
      {
        $group: {
          _id: "$userId"
        }
      }
    ]);

    return subscriptions.map(sub => sub._id.toString());
  } catch (error) {
    console.error(`Ошибка при поиске пользователей с подпиской к эксперту ${expertId} и неоценёнными видео:`, error);
    throw error;
  }
};

const findUnreviewedVideoExperts = async () => {
  const currentDate = new Date();

  try {
    const videos = await Video.find({ isEvaluated: false }).select('userId').lean();
    const userIds = videos.map(video => video.userId);

    const subscriptions = await Subscription.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          $or: [
            { status: 'Active' },
            { end: { $gte: currentDate } }
          ]
        }
      },
      {
        $group: {
          _id: "$expertId",
          users: { $push: "$userId" }
        }
      }
    ]);

    return subscriptions.map(sub => {
      return { expertId: sub._id, users: sub.users };
    });
  } catch (error) {
    console.error('Ошибка при поиске экспертов и пользователей с подпиской к ним для неоценённых видео:', error);
    throw error;
  }
};

module.exports = {
  getVideo,
  getVideoById,
  createVideo,
  updateVideo,
  updateVideoById,
  setVideoEvaluateTo,
  getNextUnratedVideo,
  findUnreviewedVideosByExpert,
  findUnreviewedVideoExperts,
};