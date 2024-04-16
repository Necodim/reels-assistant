const cron = require('node-cron');
const reminders = require('./reminders');

cron.schedule('10 20 * * *', () => {
  reminders.sendEverydayReminder();
  reminders.sendVideoReminder();
}, {
  scheduled: true,
  timezone: 'Europe/Moscow'
});
