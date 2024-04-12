const replyMarkup = (btns) => {
  return {
    reply_markup: {
      inline_keyboard: btns
    }
  }
}

const goHomeButton = [{ text: '🏠 Главное меню', callback_data: 'home' }];

const goHome = replyMarkup([goHomeButton]);

const mainMenu = (type) => {
  const userButtons = [
    [{ text: '⏯️ Отправить ролик', callback_data: 'sendVideo' }],
    [{ text: '💡 Получить идею', callback_data: 'getIdea' }],
    [
      { text: '💰 Подписка', callback_data: 'subscription' },
      { text: '❓ Поддержка', callback_data: 'support' }
    ],
    // [{ text: '⚙️ Настройки', callback_data: 'settings' }],
  ];
  const expertButtons = [
    [{ text: '💡 Опубликовать идею', callback_data: 'createIdea' }],
    [{ text: '⭐️ Оценить ролик', callback_data: 'getVideo' }],
    [{ text: '🔔 Пушнуть подопечных', callback_data: 'toPush' }],
    // [{ text: '⚙️ Настройки', callback_data: 'settings' }],
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

const moreOrGoHome = {
  // user: (ideaId = '') => {
  //   return {
  //     reply_markup: {
  //       inline_keyboard: [
  //         [{ text: '💡 Ещё идея', callback_data: 'getIdea' }, { text: '⭐️ В избранное', callback_data: `favrt:${ideaId}` }],
  //         [{ text: '🏠 Главное меню', callback_data: 'home' }],
  //       ]
  //     }
  //   }
  // },
  user: {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💡 Ещё идея', callback_data: 'getIdea' }],
        goHomeButton,
      ]
    }
  },
  expert: {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💡 Опубликовать ещё одну', callback_data: 'createIdea' }],
        goHomeButton,
      ]
    }
  }
}

const supportOrGoHome = replyMarkup([
  [{ text: '❓ Поддержка', callback_data: 'support' }],
  goHomeButton
]);

const cancel = {
  videoEvaluate: (videoId, videoMessageNumber) => {
    const buttons = [[{ text: 'Отменить', callback_data: `cnlve:${videoId}:${videoMessageNumber}` }]]
    return replyMarkup(buttons);
  }
}

const purchase = {
  user: (subscriptions = []) => {
    let buttons = [
      [{ text: '🔑 Доступ к боту', callback_data: 'prchs:0' }]
    ];
    let currentLine = [];
    subscriptions.forEach((subscription, index) => {
      let emoji;
      switch (index) {
        case 0: emoji = '1️⃣'; break;
        case 1: emoji = '2️⃣'; break;
        case 2: emoji = '3️⃣'; break;
        case 3: emoji = '4️⃣'; break;
        case 4: emoji = '5️⃣'; break;
        case 5: emoji = '6️⃣'; break;
        case 6: emoji = '7️⃣'; break;
        case 7: emoji = '8️⃣'; break;
        case 8: emoji = '9️⃣'; break;
        case 9: emoji = '🔟'; break;
        default: emoji = index + 1; break;
      }
      currentLine.push({ text: emoji, callback_data: `cnlsb:${subscription._id}` });
      if ((index + 1) % 5 === 0 || index === subscriptions.length - 1) {
        buttons.push(currentLine);
        currentLine = [];
      }
    });
    buttons.push(goHomeButton);

    return replyMarkup(buttons);
  },
  cloudpayments: (link) => {
    const buttons = [
      [{ text: '🔗 Оформить подписку', web_app: { url: link } }],
      goHomeButton,
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
    return replyMarkup([[{ text: '🗑️ Удалить', callback_data: `chanl:del:${id}` }]]);
  }
}

const snezone = replyMarkup([[{ text: 'Написать в поддержку', url: 'tg://resolve?domain=snezone' }], goHomeButton]);

module.exports = {
  replyMarkup,
  mainMenu,
  goHome,
  moreOrGoHome,
  supportOrGoHome,
  cancel,
  purchase,
  difficulty,
  hashtags,
  channel,
  snezone,
}