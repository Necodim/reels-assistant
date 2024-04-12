const express = require('express');
const path = require('path');
const app = express();
const getData = require('./getData');
const corsMiddleware = require('./corsMiddleware');
const calculateHMAC = require('./hmacCalculator');
const { formatDate, nextMonth } = require('../helpers/dateHelper');
const { addSubscription, updateSubscriptionByCloudPaymentsId, getSubscriptionByCloudPaymentsId, removeSubscription } = require('../db/service/subscriptionService');
const { getUserByUsername, getUserById, getUserByChatId } = require('../db/service/userService');
const bot = require('../bot/bot');
const { buttons } = require('../bot/helpers/buttons');
const { products } = require('../bot/helpers/products');

app.use(express.text({ type: '*/*' }))
app.use(express.static('public'));

app.get('/', (req, res) => {
  const amount = req.query.amount;
  const name = req.query.name;
  const params = `?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`;
  res.redirect(`/index.html${params}`);
});

app.get('/cloudpayments', (req, res) => {
  try {
    const amount = req.query.amount;
    const name = req.query.name;
    const params = `?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`;
    res.redirect(`/index.html${params}`);
  } catch (error) {
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

app.get('/cloudpayments/success', (req, res) => {
  console.log('success', req.body);
  res.status(200).sendFile(path.join(__dirname, 'success.html'));
});

app.get('/cloudpayments/fail', (req, res) => {
  console.log('fail', req.body);
  res.status(200).sendFile(path.join(__dirname, 'fail.html'));
});

// Обработчик вебхука check
app.post('/cloudpayments/check', (req, res) => {
  const receivedHmac = req.headers['content-hmac'] || req.headers['x-content-hmac'];
  const calculatedHmac = calculateHMAC(req.body);

  if (receivedHmac === calculatedHmac) {
    res.status(200).send({ code: 0 });
  } else {
    console.log('Invalid HMAC. Possible tampering detected.');
    res.status(401).send('Unauthorized');
  }
});

// Обработчик вебхука pay
app.post('/cloudpayments/pay', async (req, res) => {
  const receivedHmac = req.headers['content-hmac'] || req.headers['x-content-hmac'];
  const calculatedHmac = calculateHMAC(req.body);

  if (receivedHmac === calculatedHmac) {
    try {
      const data = getData(req);
      console.log('data', data);
      const { Data, Amount, SubscriptionId } = data;
      if (!!Data && !!Amount && !!SubscriptionId) {
        const chatId = JSON.parse(Data).telegram;
        console.log('chatId', chatId);
        const productPrice = parseInt(Amount, 10);
        const productName = products.find(product => product.productPrice === productPrice);
        console.log('productName', productName);
        const user = await getUserByChatId(chatId);
        console.log('user', user);
        const subscriptionDetails = {
          userId: user.id,
          name: productName,
          price: productPrice,
          subscriptionId: SubscriptionId,
          end: nextMonth(),
        }
        const subscription = await addSubscription(user.id, subscriptionDetails);
        console.log('subscription', subscription);
        const message = 'Вы успешно оформили подписку. Теперь вам доступен новый функционал.'
        const options = buttons.goHome;
        await bot.sendMessage(user.chatId, message, options);
        res.status(200).send({ code: 0 });
      } else {
        throw Error('Нет данных от CloudPayments')
      }
    } catch (error) {
      console.error('Ошибка при сохранении подписки:', error);
      res.status(500).send({ code: 13 });
    }
  } else {
    console.log('Invalid HMAC. Possible tampering detected.');
    res.status(401).send('Unauthorized');
  }
});

// Обработчик вебхука recurrent
app.post('/cloudpayments/recurrent', async (req, res) => {
  const receivedHmac = req.headers['content-hmac'] || req.headers['x-content-hmac'];
  const calculatedHmac = calculateHMAC(req.body);

  if (receivedHmac === calculatedHmac) {
    const data = getData(req);
    const { Id, Amount, Status, FailedTransactionsNumber, NextTransactionDate } = data;
    let message, options;

    try {
      if (!!Id && !!Amount && !!Status) {
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
      } else {
        throw Error('Нет данных от CloudPayments')
      }
    } catch (error) {
      console.error('Ошибка при отмене подписки', error);
      res.status(500).send({ code: 13 });
    }
  } else {
    console.log('Invalid HMAC. Possible tampering detected.');
    res.status(401).send('Unauthorized');
  }
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
