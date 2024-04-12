require('dotenv').config();
const crypto = require('crypto');

function calculateHMAC(req) {
  console.log('headers', req.headers)
  console.log('body', typeof req.body, req.body)
  let payload;
  if (req.headers['content-type'] === 'application/json') {
    payload = JSON.stringify(req.body);
  } else {
    payload = req.body;
  }
  console.log('payload', typeof payload, payload)
  const hmac = crypto.createHmac('sha256', process.env.CLOUDPAYMENTS_API_KEY);
  hmac.update(payload, 'utf8');
  return hmac.digest('base64');
}

module.exports = calculateHMAC;