const hashtags = [
  {
    name: '#коммерция',
    num: 1
  },
  {
    name: '#экспертные',
    num: 2
  },
]

const findHashtagByNumber = (number) => {
  const hashtag = hashtags.find(el => el.num == number);
  return hashtag.name;
}

module.exports = {
  findHashtagByNumber,
}