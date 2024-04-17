const Idea = require('../models/ideaModel');
const User = require('../models/userModel');

const getIdeaById = async (id) => {
  try {
    let idea = await Idea.findById(id);
    return idea;
  } catch (error) {
    console.error(`В функции getIdeaById идея с ID ${id} не найдена:`, error);
    throw error;
  }
}

const getIdeaByVideoId = async (videoId) => {
  try {
    let idea = await Idea.findOne({ videoId: videoId });
    return idea;
  } catch (error) {
    console.error(`В функции getIdeaByVideoId идея с ID ${videoId} не найдена:`, error);
    throw error;
  }
}

const createIdea = async (msg) => {
  try {
    let user = await User.findOne({ chatId: msg.chat.id });
    if (user) {
      const newVideo = new Idea({
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
    console.error('Ошибка при создании новой идеи в БД:', error);
    throw error;
  }
}

const updateIdea = async (videoId, updateData) => {
  try {
    const updatedIdea = await Idea.findOneAndUpdate(
      { videoId: videoId },
      { $set: updateData },
      { new: true }
    );

    if (updatedIdea) {
      return updatedIdea;
    } else {
      throw new Error('Идея не найдена');
    }
  } catch (error) {
    console.error('Ошибка при обновлении идеи в БД:', error);
    throw error;
  }
}

const updateIdeaById = async (id, updateData) => {
  try {
    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (updatedIdea) {
      return updatedIdea;
    } else {
      throw new Error('Идея не найдена');
    }
  } catch (error) {
    console.error('Ошибка при обновлении идеи в БД:', error);
    throw error;
  }
}

const deleteIdeaById = async (id) => {
  try {
    const deletedIdea = await Idea.findByIdAndDelete(id);
    return deletedIdea;
  } catch (error) {
    console.error('Ошибка при удалении идеи из БД:', error);
    throw error;
  }
}

const findExpertsWithNoRecentIdeas = async () => {
  const expertsWithNoRecentIdeas = [];
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  try {
    const experts = await User.find({ isExpert: true });
    for (const expert of experts) {
      const recentIdea = await Idea.findOne({
        userId: expert._id,
        createdAt: { $gt: oneDayAgo }
      });
      if (!recentIdea) {
        expertsWithNoRecentIdeas.push(expert);
      }
    }
    return expertsWithNoRecentIdeas;
  } catch (error) {
    console.error('Error finding experts with no recent ideas:', error);
    throw error;
  }
}

module.exports = {
  getIdeaById,
  getIdeaByVideoId,
  createIdea,
  updateIdea,
  updateIdeaById,
  deleteIdeaById,
  findExpertsWithNoRecentIdeas,
};