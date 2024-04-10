const mainMenu = {
  user: {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⏯️ Отправить ролик', callback_data: 'sendVideo' }],
        [{ text: '💡 Получить идею', callback_data: 'getIdea' }],
        [{ text: '⚙️ Настройки', callback_data: 'settings' }],
      ]
    }
  },
  expert: {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💡 Опубликовать идею', callback_data: 'createIdea' }],
        [{ text: '⭐️ Оценить ролик', callback_data: 'getVideo' }],
        [{ text: '🔔 Пушнуть подопечных', callback_data: 'toPush' }],
        // [{ text: '⚙️ Настройки', callback_data: 'settings' }],
      ]
    }
  }
}

const goHome = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🏠 Главное меню', callback_data: 'home' }],
    ]
  }
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
        [{ text: '🏠 Главное меню', callback_data: 'home' }],
      ]
    }
  },
  expert: {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💡 Опубликовать ещё одну', callback_data: 'createIdea' }],
        [{ text: '🏠 Главное меню', callback_data: 'home' }],
      ]
    }
  }
}

const purchase = {
  user: {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💡 Библиотека идей', callback_data: 'prchs:1' }],
        [{ text: '🛟 Рилс-ассистент', callback_data: 'prchs:2' }],
        [{ text: '🎦 Рилс-аутсорс', callback_data: 'prchs:3' }],
      ]
    }
  }
}

const difficulty = (id) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '1', callback_data: `dfclt:1:${id}` },
          { text: '2', callback_data: `dfclt:2:${id}` },
          { text: '3', callback_data: `dfclt:3:${id}` }
        ],
      ]
    }
  }
}

const hashtags = (id) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💰 Коммерческая', callback_data: `hshtg:1:${id}` },
          { text: '🧠 Экспертная', callback_data: `hshtg:2:${id}` },
        ],
      ]
    }
  }
}

const channel = {
  delete: (id) => {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🗑️ Удалить', callback_data: `chanl:del:${id}` }],
        ]
      }
    }
  }
}

module.exports = {
  mainMenu,
  goHome,
  moreOrGoHome,
  purchase,
  difficulty,
  hashtags,
  channel,
}