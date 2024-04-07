require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./userModel');

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

module.exports = {
  User,
};