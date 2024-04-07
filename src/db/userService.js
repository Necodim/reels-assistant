const User = require('./userModel');

async function upsertUser(msg) {
  try {
    let user = await User.findOne({ chatId: msg.from.id });

    if (user) {
      await User.updateOne({ chatId: msg.from.id }, {
        $set: {
          firstName: msg.from.first_name,
          lastName: msg.from.last_name,
          username: msg.from.username,
        } 
      });
    } else {
      user = new User({
        chatId: msg.from.id,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
        username: msg.from.username,
      });

      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Ошибка при обновлении или создании пользователя:', error);
    throw error;
  }
}

module.exports = {
  upsertUser,
};