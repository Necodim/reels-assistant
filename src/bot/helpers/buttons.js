const emojiHelper = require("../../helpers/emojiHelper");
const { products } = require("./products");

const replyMarkup = (btns) => {
  return {
    reply_markup: {
      inline_keyboard: btns
    }
  }
}

const getProductButton = (i) => {
  return [{ text: `${products[i].emoji} ${products[i].name} (${products[i].price}₽)`, callback_data: 'prchs:0' }]
}

const homeButton = [{ text: '🏠 Главное меню', callback_data: 'home' }];

const mainMenu = (type) => {
  const userButtons = [
    [{ text: '⏯️ Отправить ролик', callback_data: 'sendVideo' }],
    [{ text: '💡 Получить идею', callback_data: 'getIdea' }],
    [
      { text: '💳 Подписка', callback_data: 'subscription' },
      { text: '❓ Поддержка', callback_data: 'support' }
    ],
    // [{ text: '⚙️ Настройки', callback_data: 'stngs:user' }],
  ];
  const expertButtons = [
    [{ text: '💡 Опубликовать идею', callback_data: 'createIdea' }],
    [{ text: '⭐️ Оценить ролик', callback_data: 'getVideo' }],
    [{ text: '⚙️ Настройки', callback_data: 'stngs:expert' }],
  ];
  let result;
  switch (type) {
    case 'user':
      result = replyMarkup(userButtons);
      break;
    case 'expert':
      result = replyMarkup(expertButtons);
      break;
    default:
      result = {}
      break;
  }
  return result;
}

const home = (type = '', id = '') => {
  const method = type.split(':')[0];
  const buttons = new Array();
  const buttonLine = new Array();
  switch (method) {
    case 'about':
      buttonLine.push({ text: '💁‍♀️ Обо мне', callback_data: type });
      break;
    case 'cnlsb':
      buttonLine.push({ text: '❌ Отменить подписку', callback_data: type });
      break;
    case 'createIdea':
      buttonLine.push({ text: '💡 Опубликовать идею', callback_data: type });
      break;
    case 'createYetIdea':
      buttonLine.push({ text: '💡 Опубликовать ещё одну', callback_data: 'createIdea' });
      break;
    case 'evaluateVideo':
      buttonLine.push({ text: '⭐️ Оценить ролик', callback_data: 'getVideo' });
      break;
    case 'getIdea':
      if (!!id) {
        buttonLine.push({ text: '💡 Получить идею', callback_data: type }, { text: '⭐️ В избранное', callback_data: `favrt:${id}` });
      } else {
        buttonLine.push({ text: '💡 Получить идею', callback_data: type });
      }
      break;
    case 'getYetIdea':
      if (!!id) {
        buttonLine.push({ text: '💡 Ещё идея', callback_data: 'getIdea' }, { text: '⭐️ В избранное', callback_data: `favrt:${id}` });
      } else {
        buttonLine.push({ text: '💡 Ещё идея', callback_data: 'getIdea' });
      }
      break;
    case 'sendVideo':
      buttonLine.push({ text: '⏯️ Отправить ролик', callback_data: type });
      break;
    case 'sendYetVideo':
      buttonLine.push({ text: '⏯️ Отправить ещё ролик', callback_data: 'sendVideo' });
      break;
    case 'subscription':
      buttonLine.push({ text: '💳 Подписка', callback_data: 'subscription' });
      break;
    case 'support':
      buttonLine.push({ text: '❓ Поддержка', callback_data: type });
      break;
    default:
      break;
  }
  if (buttonLine.length) {
    buttons.push(buttonLine);
  }
  buttons.push(homeButton);
  return replyMarkup(buttons);
}

const cancel = {
  videoEvaluate: (videoId, videoMessageNumber) => {
    const buttons = [[{ text: 'Отменить', callback_data: `cnlve:${videoId}:${videoMessageNumber}` }]]
    return replyMarkup(buttons);
  }
}

const purchase = {
  user: (subscriptions = []) => {
    let buttons = [];
    let currentLine = [];

    // if (subscriptions.length > 0) {
      products.forEach((product, i) => {
        if (i === 0) { // убрать условие, если будет больше подписок
          const hasSubscription = subscriptions.some(subscription => subscription.name === product.name);
          if (!hasSubscription) {
            const productButton = getProductButton(i);
            buttons.push(productButton);
          }
        }
      });
    // }

    subscriptions.forEach((subscription, index) => {
      const emoji = emojiHelper.number(index);
      currentLine.push({ text: emoji, callback_data: `getsb:${subscription._id}` });
      if ((index + 1) % 5 === 0 || index === subscriptions.length - 1) {
        buttons.push(currentLine);
        currentLine = [];
      }
    });
    buttons.push(homeButton);

    return replyMarkup(buttons);
  },
  cloudpayments: (link) => {
    const buttons = [
      [{ text: '🔗 Оформить подписку', web_app: { url: link } }],
      homeButton,
    ];
    return replyMarkup(buttons);
  }
}

const difficulty = (id) => {
  const buttons = [
    [
      { text: '1', callback_data: `dfclt:1:${id}` },
      { text: '2', callback_data: `dfclt:2:${id}` },
      { text: '3', callback_data: `dfclt:3:${id}` }
    ],
  ]
  return replyMarkup(buttons);
}

const hashtags = (id) => {
  const buttons = [
    [
      { text: '💰 Коммерческая', callback_data: `hshtg:1:${id}` },
      { text: '🧠 Экспертная', callback_data: `hshtg:2:${id}` },
    ],
  ];
  return replyMarkup(buttons);
}

const channel = {
  delete: (id) => {
    return replyMarkup([[{ text: '🗑️ Удалить', callback_data: `outsd:del:${id}` }]]);
  }
}

const snezone = replyMarkup([[{ text: 'Написать в поддержку', url: 'tg://resolve?domain=snezone' }], homeButton]);

module.exports = {
  replyMarkup,
  mainMenu,
  home,
  homeButton,
  cancel,
  purchase,
  difficulty,
  hashtags,
  channel,
  snezone,
}