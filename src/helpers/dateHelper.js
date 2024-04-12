const { format, addMonths } = require('date-fns');
const { ru } = require('date-fns/locale');

// Формат 'd MMMM, HH:mm' выведет '12 июня, 15:47'

const formatDate = (date, dateFormat) => {
  const formatedDate = format(new Date(date), dateFormat, { locale: ru });
  return formatedDate;
};

const nextMonth = () => {
  const now = new Date();
  const newDate = addMonths(now, 1);
  return newDate;
}

module.exports = {
  formatDate,
  nextMonth,
}