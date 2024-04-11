const link = (name, amount) => {
  // http://api.reelsassistant.ru/cloudpayments?
  return `tg://resolve?domain=reels_assistant_bot&appname=cloudpayments&amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`;
}

const products = [
  {
    name: 'Доступ к боту',
    link: `tg://resolve?domain=reels_assistant_bot&appname=cloudpayments&amount=990&name=${encodeURIComponent('Доступ к боту')}`,
    price: 990,
  },
  {
    name: 'Библиотека идей',
    link: `tg://resolve?domain=reels_assistant_bot&appname=cloudpayments&amount=990&name=${encodeURIComponent('Библиотека идей')}`,
    price: 990,
  },
  {
    name: 'Рилс-ассистент',
    link: `tg://resolve?domain=reels_assistant_bot&appname=cloudpayments&amount=2990&name=${encodeURIComponent('Рилс-ассистент')}`,
    price: 2990,
  }
];

const text = `💡 Библиотека идей для рилс без лимитов 
🛟 Рилс-ассистент: докрутит идею видео, даст обратную связь и напомнит о предстоящих публикациях

Приобрести подписку можно, нажав соответствующую кнопку 👇`;

module.exports = {
  products,
  text,
}