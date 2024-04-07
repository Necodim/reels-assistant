const bot = require('./bot');
const { handleStartCommand, handleHelpCommand, handleExpertCommand } = require('./messageHandlers');
const callbackHandlers = require('./callbackHandlers');

bot.onText(/\/start/, async (msg) => {
    await handleStartCommand(msg);
});

bot.onText(/\/help/, async (msg) => {
    await handleHelpCommand(msg);
});

bot.onText(/\/expert/, async (msg) => {
  await handleExpertCommand(msg);
});

bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const type = data.split(':')[0];
    const query = data.split(':')[1];
    switch (type) {
        case 'help':
            switch (query) {
                case 'start_app':
                    await callbackHandlers.help_start_app(callbackQuery);
                    break;
                case 'subscription':
                    await callbackHandlers.help_subscription(callbackQuery);
                    break;
                case 'role':
                    await callbackHandlers.help_role(callbackQuery);
                    break;
                default:
                    console.log(`Неизвестный help callback_data_query: ${query}`);
            }
            break;
        default:
            console.log(`Неизвестный callback_data: ${data}`);
    }
});