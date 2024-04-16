const getPlural = (n, form1, form2, form5) => {
  let nAbs = Math.abs(n) % 100;
  let n1 = n % 10;
  if (nAbs > 10 && nAbs < 20) return form5;
  if (n1 > 1 && n1 < 5) return form2;
  if (n1 == 1) return form1;
  return form5;
}

module.exports = {
  getPlural
}