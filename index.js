require('./src/cron/index');
require('./src/payments/index');
require('./src/bot/events/events');
const { initMongo } = require('./src/db/index');

initMongo();