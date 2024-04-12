const number = (index) => {
  let result;
  switch (index) {
    case 0: result = '1️⃣'; break;
    case 1: result = '2️⃣'; break;
    case 2: result = '3️⃣'; break;
    case 3: result = '4️⃣'; break;
    case 4: result = '5️⃣'; break;
    case 5: result = '6️⃣'; break;
    case 6: result = '7️⃣'; break;
    case 7: result = '8️⃣'; break;
    case 8: result = '9️⃣'; break;
    case 9: result = '🔟'; break;
    default: result = index + 1; break;
  }
  return result;
}

module.exports = {
  number,
}