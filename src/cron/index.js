const cron = require('node-cron');
const reminders = require('./reminders');

cron.schedule('0 12 * * *', () => {
  reminders.sendIdeaReminder();
}, {
  scheduled: true,
  timezone: 'Europe/Moscow'
});

cron.schedule('0 12 * * *', () => {
  reminders.sendEvaluateIdeaReminder();
}, {
  scheduled: true,
  timezone: 'Europe/Moscow'
});

cron.schedule('0 14 * * *', () => {
  reminders.sendEverydayReminder();
}, {
  scheduled: true,
  timezone: 'Europe/Moscow'
});

cron.schedule('0 15 * * *', () => {
  reminders.sendVideoReminder();
}, {
  scheduled: true,
  timezone: 'Europe/Moscow'
});
