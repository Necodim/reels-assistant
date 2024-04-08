const mainMenu = {
  user: {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Отправить ролик', callback_data: 'sendVideo' }],
        [{ text: 'Получить идеи', callback_data: 'getIdeas' }],
        [{ text: 'Настройки', callback_data: 'settings' }],
      ]
    }
  },
  expert: {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Опубликовать идею', callback_data: 'createIdea' }],
        [{ text: 'Оценить ролик', callback_data: 'getVideo' }],
        [{ text: 'Пушнуть подопечных', callback_data: 'toPush' }],
        // [{ text: 'Настройки', callback_data: 'settings' }],
      ]
    }
  }
}

const goHome = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Главное меню', callback_data: 'home' }],
    ]
  }
}

const addAnotherAndGoHome = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Опубликовать ещё одну', callback_data: 'createIdea' }],
      [{ text: 'Главное меню', callback_data: 'home' }],
    ]
  }
}

const channel = {
  delete: {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Удалить', callback_data: 'channel:delete' }],
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
          { text: 'Коммерческая', callback_data: `hshtg:1:${id}` },
          { text: 'Экспертная', callback_data: `hshtg:2:${id}` },
        ],
      ]
    }
  }
}

module.exports = {
  mainMenu,
  goHome,
  addAnotherAndGoHome,
  channel,
  difficulty,
  hashtags,
}