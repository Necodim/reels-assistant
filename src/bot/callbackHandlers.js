const bot = require('./bot');

async function help_start_app(callbackQuery) {
    const message = callbackQuery.message;
    try {
        await bot.answerCallbackQuery(callbackQuery.id);
        await bot.sendMessage(message.chat.id, 'Чтобы запустить приложение, напишите команду /start или нажмите кнопку «App» внизу. Также приложение можно запустить по ссылке t.me/unpacksbot/app');
    } catch (error) {
        console.error(error);
    }
}

async function help_subscription(callbackQuery) {
    const message = callbackQuery.message;
    try {
        await bot.answerCallbackQuery(callbackQuery.id);
        await bot.sendMessage(message.chat.id, 'Зайдите в приложение, выберите роль «Селлер», на вкладке «Профиль» нажмите кнопку «Оформить».');
    } catch (error) {
        console.error(error);
    }
}

async function help_role(callbackQuery) {
    const message = callbackQuery.message;
    try {
        await bot.answerCallbackQuery(callbackQuery.id);
        await bot.sendMessage(message.chat.id, 'Откройте приложение. В верхнем правом углу нажмите на три точки и выберите «Настройки». В настройках вы можете изменить роль.');
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    help_start_app,
    help_subscription,
    help_role,
};
