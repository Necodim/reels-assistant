const express = require('express');
const path = require('path');
const app = express();
const { formatDate, nextMonth } = require('../helpers/dateHelper');
const { addSubscription, updateSubscriptionByCloudPaymentsId, getSubscriptionByCloudPaymentsId, removeSubscription } = require('../db/service/subscriptionService');
const { getUserByUsername, getUserById } = require('../db/service/userService');
const bot = require('../bot/bot');
const { buttons } = require('../bot/helpers/buttons');
const { products } = require('../bot/helpers/products');

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '..', '..', 'index.html'));
});

app.get('/cloudpayments', (req, res) => {
  try {
    const amount = req.query.amount;
    const name = req.query.name;

    res.redirect(`/src/payments/cloudpayments.html?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`);
  } catch (error) {
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

app.get('/cloudpayments/success', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'success.html'));
});

app.get('/cloudpayments/fail', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'fail.html'));
});

// Обработчик вебхука check
app.post('/cloudpayments/check', (req, res) => {
  res.status(200).send({ code: 0 });
});

// Обработчик вебхука pay
app.post('/cloudpayments/pay', async (req, res) => {
  const { Data, Amount, SubscriptionId } = req.body;

  try {
    const username = Data.telegram.replace('@', '');
    const price = parseInt(Amount, 10);
    const name = products.find(product => product.price === price);
    const user = await getUserByUsername(username);
    const subscriptionDetails = {
      userId: user.id,
      name: name,
      price: price,
      subscriptionId: SubscriptionId,
      end: nextMonth(),
    }
    await addSubscription(user.id, subscriptionDetails);
    const message = 'Вы успешно оформили подписку. Теперь вам доступен новый функционал.'
    const options = buttons.goHome;
    await bot.sendMessage(user.chatId, message, options);
    res.status(200).send({ code: 0 });
  } catch (error) {
    console.error('Ошибка при сохранении подписки:', error);
    res.status(500).send({ code: 13 });
  }
});

// Обработчик вебхука recurrent
app.post('/cloudpayments/recurrent', async (req, res) => {
  const { Id, Amount, Status, FailedTransactionsNumber, NextTransactionDate } = req.body;
  let message, options;
  
  try {
    if (Status !== 'Active') {
      const subscription = getSubscriptionByCloudPaymentsId(Id);
      const user = getUserById(subscription.userId);
      const amount = parseInt(Amount, 10);

      switch (Status) {
        case 'PastDue':
          message = `Подписка просрочена. Нам не удалось списать ежемесячный платёж. Для платежа требуется ${amount}₽. `;
          message += FailedTransactionsNumber < 2 ? 'Пополните баланс, мы попробуем списать ежемесячный платёж чуть позже.' : 'Проверьте баланс. После следующей попытки подписка отменится.';
          options = buttons.goHome;
          await bot.sendMessage(user.chatId, message, options);
          break;
        default:
          message = 'Подписка отменена. Вы можете оформить подписку заново, нажав кнопку ниже 👇';
          options = buttons.purchase.user;
          await removeSubscription(user.id, subscription.id);
          await bot.sendMessage(user.chatId, message, options);
          break;
      }
    } else {
      const subscription = await updateSubscriptionByCloudPaymentsId(Id, { end: NextTransactionDate });
      const date = formatDate(subscription.end, 'd MMMM, HH:mm');
      const user = getUserById(subscription.userId);
      
      message = `Подписка успешно продлена. Дата следующего списания: ${date}`
      options = buttons.goHome;
      await bot.sendMessage(user.chatId, message, options);
    }
    res.status(200).send({ code: 0 });
  } catch (error) {
    console.error('Ошибка при отмене подписки', error);
    res.status(500).send({ code: 13 });
  }
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
