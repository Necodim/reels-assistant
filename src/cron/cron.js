const cron = require('node-cron');
const reminders = require('./reminders');

cron.schedule('0 20 05 * *', () => {
  reminders.sendEverydayReminder();
  reminders.sendVideoReminder();
}, {
  scheduled: true,
  timezone: 'Europe/Moscow'
});
