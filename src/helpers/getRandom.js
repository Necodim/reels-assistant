const getRandomElement = (arr) => {
  if (arr.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

module.exports = {
  getRandomElement,
}