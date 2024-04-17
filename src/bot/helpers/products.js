const link = (name, amount) => {
  return `https://api.reelsassistant.ru/cloudpayments?amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`;
}

const products = [
  {
    emoji: '🔑',
    descr: 'разблокируйте все возможности бота',
    name: 'Доступ к боту',
    price: 990,
    get link() {
      return link(this.name, this.price);
    }
  },
  {
    emoji: '💡',
    descr: 'для рилс без лимитов',
    name: 'Библиотека идей',
    price: 990,
    get link() {
      return link(this.name, this.price);
    }
  },
  {
    emoji: '🛟',
    descr: 'докрутит идею видео, даст обратную связь и напомнит о предстоящих публикациях',
    name: 'Рилс-ассистент',
    price: 2990,
    get link() {
      return link(this.name, this.price);
    }
  }
];

const text = `${products[1].emoji} ${products[1].name} ${products[1].descr}
${products[2].emoji} ${products[2].name} ${products[2].descr}

Приобрести подписку можно, нажав соответствующую кнопку 👇`;

module.exports = {
  products,
  text,
}