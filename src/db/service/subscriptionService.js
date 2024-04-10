const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

const getSubscription = async (subscriptionId) => {
  try {
    const subscription = Subscription.findById(subscriptionId);
    return subscription;
  } catch (error) {
    console.error(`Не удалось найти подписку ${subscriptionId}:`, error);
  }
};

const getUserSubscriptions = async (userId) => {
  try {
    const userWithSubscriptions = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscriptions',
          foreignField: '_id',
          as: 'subscriptionsInfo'
        }
      },
      {
        $project: {
          subscriptionsInfo: 1,
          _id: 0
        }
      }
    ]);

    if (userWithSubscriptions.length > 0) {
      console.log('Информация о подписках пользователя:', userWithSubscriptions[0].subscriptionsInfo);
      return userWithSubscriptions[0].subscriptionsInfo;
    } else {
      console.log('Пользователь не найден или у него нет подписок');
      return null;
    }
  } catch (error) {
    console.error('Ошибка при получении информации о подписках пользователя:', error);
    return null;
  }
};

const addSubscription = async (userId, subscriptionDetails) => {
  try {
    const subscription = new Subscription(subscriptionDetails);
    await subscription.save();

    await User.findByIdAndUpdate(userId, { $push: { subscriptions: subscription._id } });

    console.log(`Подписка ${subscription.name} добавлена пользователю ${userId}`);
  } catch (error) {
    console.error('Ошибка при добавлении подписки:', error);
  }
};

const removeSubscription = async (userId, subscriptionId) => {
  try {
    await User.findByIdAndUpdate(userId, { $pull: { subscriptions: subscriptionId } });
    await Subscription.findByIdAndRemove(subscriptionId);

    console.log(`Подписка ${subscriptionId} удалена у пользователя ${userId}`);
  } catch (error) {
    console.error('Ошибка при удалении подписки:', error);
  }
};

module.exports = {
  getSubscription,
  getUserSubscriptions,
  addSubscription,
  removeSubscription,
}