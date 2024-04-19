const mongoose = require('mongoose');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

const getSubscriptionById = async (id) => {
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

const getUserSubscription = async (userId, subscriptionId) => {
  try {
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const subscriptionIdObj = new mongoose.Types.ObjectId(subscriptionId);

    const subscription = await Subscription.findOne({
      _id: subscriptionIdObj,
      userId: userIdObj
    }).populate('expertId', 'about');

    if (subscription) {
      return subscription;
    } else {
      console.log('Подписка не найдена или не принадлежит данному пользователю');
      return null;
    }
  } catch (error) {
    console.error('Ошибка при поиске конкретной подписки пользователя:', error);
    return null;
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
      return userWithSubscriptions[0].subscriptionsInfo;
    } else {
      console.log('Пользователь не найден или у него нет подписок');
      return [];
    }
  } catch (error) {
    console.error('Ошибка при получении информации о подписках пользователя:', error);
    return [];
  }
};

const addSubscription = async (data) => {
  try {
    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new TypeError('Ожидается объект с данными подписки');
    }
    const subscription = new Subscription(data);
    await subscription.save();
    if (data.userId) {
      await User.findByIdAndUpdate(data.userId, { $push: { subscriptions: subscription._id } });
    }
    console.log(`Подписка ${subscription.name} добавлена пользователю ${data.userId}`);
  } catch (error) {
    console.error('Ошибка при добавлении подписки:', error);
    throw error;
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

const getSubscriptionsCount = async () => {
  try {
    const count = await Subscription.estimatedDocumentCount();
    return count;
  } catch (error) {
    console.error('Ошибка при подсчёте количества подписок:', error);
  }
};

const getExpertSubscriberCount = async (expertId) => {
  try {
    const expertIdObj = new mongoose.Types.ObjectId(expertId);

    const result = await Subscription.aggregate([
      { $match: { expertId: expertIdObj } },
      {
        $group: {
          _id: "$expertId",
          uniqueSubscribers: { $addToSet: "$userId" },
          totalSubscriptions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          unique: { $size: "$uniqueSubscribers" },
          all: "$totalSubscriptions"
        }
      }
    ]);

    if (result.length > 0) {
      return result[0];
    } else {
      return { unique: 0, all: 0 };
    }
  } catch (error) {
    console.error('Ошибка при получении количества подписчиков:', error);
    throw error;
  }
};

module.exports = {
  getSubscriptionById,
  getSubscriptionByCloudPaymentsId,
  getUserSubscription,
  getUserSubscriptions,
  addSubscription,
  updateSubscription,
  updateSubscriptionByCloudPaymentsId,
  removeSubscription,
  getSubscriptionsCount,
  getExpertSubscriberCount,
}