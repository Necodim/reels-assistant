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
        [{ text: 'Новая идея', callback_data: 'new_idea' }],
        [{ text: 'Оценить ролик', callback_data: 'get_video' }],
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

module.exports = {
  mainMenu,
  goHome,
}