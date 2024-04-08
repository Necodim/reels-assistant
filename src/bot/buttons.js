const mainMenu = {
  user: {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Отправить ролик', callback_data: 'send_video' }],
        [{ text: 'Получить идеи', callback_data: 'get_ideas' }],
        [{ text: 'Настройки', callback_data: 'settings' }],
      ]
    }
  },
  expert: {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Опубликовать идею', callback_data: 'new_idea' }],
        [{ text: 'Оценить ролик', callback_data: 'get_video' }],
        [{ text: 'Пушнуть подопечных', callback_data: 'to_push' }],
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

const difficulty = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '1', callback_data: 'difficulty_1' }, { text: '2', callback_data: 'difficulty_2' }, { text: '3', callback_data: 'difficulty_3' }],
    ]
  }
}

const hashtags = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Экспертная', callback_data: 'hashtag_expert' }],
      [{ text: 'Коммерческая', callback_data: 'hashtag_commercial' }],
    ]
  }
}

module.exports = {
  mainMenu,
  goHome,
  difficulty,
  hashtags,
}