const express = require('express');
const path = require('path');
const app = express();
const getData = require('./getData');
const corsMiddleware = require('./corsMiddleware');
const calculateHMAC = require('./hmacCalculator');
const { formatDate, nextMonth } = require('../helpers/dateHelper');
const { addSubscription, updateSubscriptionByCloudPaymentsId, getSubscriptionByCloudPaymentsId, removeSubscription, getUserSubscriptions } = require('../db/service/subscriptionService');
const { getUserByUsername, getUserById, getUserByChatId, getLeastFrequentExpert } = require('../db/service/userService');
const bot = require('../bot/bot');
const buttons = require('../bot/helpers/buttons');
const products = require('../bot/helpers/products');
const { sendAnswerOutside, sendSubscriberOutside } = require('../bot/send');

app.use(express.text({ type: '*/*' }))
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.get('/', (req, res) => {
  const amount = req.query.amount;
  const name = req.query.name;
  // const token = req.query.token;
  // const params = `?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}`;
  const params = `?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`;
  res.redirect(`/index.html${params}`);
});

app.get('/offer', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', '/offer.html'));
});

app.get('/cloudpayments', (req, res) => {
  try {
    const amount = req.query.amount;
    const name = req.query.name;
    // const token = req.query.token;
    // const params = `?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}`;
    const params = `?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`;
    res.redirect(`/index.html${params}`);
  } catch (error) {
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

app.get('/payment/success', (req, res) => {
  console.log('success', req.body);
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'payment', '/success.html'));
});

app.get('/payment/fail', (req, res) => {
  console.log('fail', req.body);
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'payment', '/fail.html'));
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
      // const { Data, Amount, SubscriptionId, Token } = data;
      const { Data, Amount, SubscriptionId } = data;
      if (!!Data && !!Amount && !!SubscriptionId) {
        const chatId = JSON.parse(Data).CloudPayments.telegram;
        const productPrice = parseInt(Amount, 10);
        const productName = products.products.find(product => product.price === productPrice).name;
        const user = await getUserByChatId(chatId);
        const expert = await getLeastFrequentExpert();
        const subscriptionDetails = {
          userId: user._id,
          expertId: expert._id,
          name: productName,
          price: productPrice,
          subscriptionId: SubscriptionId,
          end: nextMonth(),
          status: 'Active',
          // token: Token,
        }
        await addSubscription(subscriptionDetails);
        
        const messageUser = `✅ Вы успешно оформили подписку. Теперь вам доступен новый функционал.

Информация о вашем эксперте:
<blockquote>${expert.about}</blockquote>`
        const optionsUser = {...buttons.home(), parse_mode: 'HTML'};
        await bot.sendMessage(user.chatId, messageUser, optionsUser);

        const messageExpert = 'У вас новый подопечный. Скоро он начнёт присылать свои видео на оценку, а я буду уведомлять вас об этом 😉'
        await bot.sendMessage(expert.chatId, messageExpert);
        await sendSubscriberOutside(expert, user.username);
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
          const subscriptions = getUserSubscriptions(subscription.userId);
          const amount = parseInt(Amount, 10);

          switch (Status) {
            case 'PastDue':
              message = `Подписка просрочена. Нам не удалось списать ежемесячный платёж. Для платежа требуется ${amount}₽. `;
              message += FailedTransactionsNumber < 2 ? 'Пополните баланс, мы попробуем списать ежемесячный платёж чуть позже.' : 'Проверьте баланс. После следующей попытки подписка отменится.';
              options = buttons.home();
              await bot.sendMessage(user.chatId, message, options);
              break;
            default:
              message = 'Подписка отменена. Вы можете оформить подписку заново, нажав кнопку ниже 👇';
              options = buttons.purchase.user(subscriptions);
              await removeSubscription(user._id, subscription._id);
              await bot.sendMessage(user.chatId, message, options);
              break;
          }
        } else {
          const subscription = await updateSubscriptionByCloudPaymentsId(Id, { end: NextTransactionDate, status: Status });
          const date = formatDate(subscription.end, 'd MMMM, HH:mm');
          const user = getUserById(subscription.userId);

          message = `Подписка успешно продлена. Дата следующего списания: ${date}`
          options = buttons.home();
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
