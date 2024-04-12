require('dotenv').config();
const crypto = require('crypto');

const calculateHMAC = (data) => {
  const hmac = crypto.createHmac('sha256', process.env.CLOUDPAYMENTS_API_KEY);
  hmac.update(data, 'utf8');
  const result = hmac.digest('base64');
  console.log('result', result);
  return result;
}

module.exports = calculateHMAC;