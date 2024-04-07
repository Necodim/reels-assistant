require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./userModel');

const initMongo = async () => {
  try {
    const mongo = await mongoose.connect(process.env.MONGODB_URI);
    console.log(mongo);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
  }
}

module.exports = {
  initMongo,
  User,
};