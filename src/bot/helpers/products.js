const link = (name, amount) => {
  // http://api.reelsassistant.ru/cloudpayments?
  return `https://api.reelsassistant.ru/cloudpayments&amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`;
}

const products = [
  {
    name: 'Доступ к боту',
    price: 990,
    get link() {
      return link(this.name, this.price);
    }
  },
  {
    name: 'Библиотека идей',
    price: 990,
    get link() {
      return link(this.name, this.price);
    }
  },
  {
    name: 'Рилс-ассистент',
    price: 2990,
    get link() {
      return link(this.name, this.price);
    }
  }
];

const text = `💡 Библиотека идей для рилс без лимитов 
🛟 Рилс-ассистент: докрутит идею видео, даст обратную связь и напомнит о предстоящих публикациях

Приобрести подписку можно, нажав соответствующую кнопку 👇`;

module.exports = {
  products,
  text,
}