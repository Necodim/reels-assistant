const mongoose = require('mongoose');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

const getSubscription = async (id) => {
  try {
    const subscription = Subscription.findById(id);
    return subscription;
  } catch (error) {
    console.error(`Не удалось найти подписку по ID ${id}:`, error);
  }
};

const getSubscriptionByCloudPaymentsId = async (subscriptionId) => {
  try {
    const subscription = Subscription.findOne({ subscriptionId: subscriptionId });
    return subscription;
  } catch (error) {
    console.error(`Не удалось найти подписку по CloudPayments ID ${subscriptionId}:`, error);
  }
};

const getUserSubscriptions = async (userId) => {
  const userIdObj = new mongoose.Types.ObjectId(userId);

  try {
    const userWithSubscriptions = await User.aggregate([
      { $match: { _id: userIdObj } },
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

const addSubscription = async (data) => {
  try {
    const subscription = new Subscription(data);
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, { $push: { subscriptions: subscription._id } });

    console.log(`Подписка ${subscription.name} добавлена пользователю ${userId}`);
  } catch (error) {
    console.error('Ошибка при добавлении подписки:', error);
  }
};

const updateSubscription = async (id, data) => {
  try {
    // Поиск и обновление подписки по subscriptionId
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true } // Опция new: true гарантирует, что в ответе будет возвращен обновленный документ
    );

    if (!updatedSubscription) {
      console.log(`Подписка с ID ${subscriptionId} не найдена.`);
      return null;
    }

    console.log('Подписка успешно обновлена:', updatedSubscription);
    return updatedSubscription;
  } catch (error) {
    console.error('Ошибка при обновлении подписки:', error);
    throw error;
  }
};

const updateSubscriptionByCloudPaymentsId = async (subscriptionId, data) => {
  try {
    // Поиск и обновление подписки по subscriptionId
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { subscriptionId: subscriptionId },
      { $set: data },
      { new: true } // Опция new: true гарантирует, что в ответе будет возвращен обновленный документ
    );

    if (!updatedSubscription) {
      console.log(`Подписка с ID ${subscriptionId} не найдена.`);
      return null;
    }

    console.log('Подписка успешно обновлена:', updatedSubscription);
    return updatedSubscription;
  } catch (error) {
    console.error('Ошибка при обновлении подписки:', error);
    throw error;
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
  getSubscriptionByCloudPaymentsId,
  getUserSubscriptions,
  addSubscription,
  updateSubscription,
  updateSubscriptionByCloudPaymentsId,
  removeSubscription,
}