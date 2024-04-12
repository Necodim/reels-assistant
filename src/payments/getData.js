const getData = (req) => {
  let dataObject;
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    const bodyString = req.body;
    const params = new URLSearchParams(bodyString);
    dataObject = Object.fromEntries(params);
  } else if (req.headers['content-type'] === 'application/json') {
    const bodyString = req.body; // получаем данные как строку
    dataObject = JSON.parse(bodyString);
  } else {
    dataObject = req.body;
  }
  return dataObject;
}

module.exports = getData;