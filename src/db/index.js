require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Video = require('./models/videoModel');
const Idea = require('./models/ideaModel');
const UserIdeas = require('./models/userIdeasModel');

const initMongo = async () => {
  try {
    const mongo = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
  }
}

module.exports = {
  initMongo,
  User,
  Video,
  Idea,
  UserIdeas,
};