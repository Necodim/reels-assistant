require('dotenv').config();
const crypto = require('crypto');

function calculateHMAC(req) {
    let payload;
    if (req.headers['content-type'] === 'application/json') {
      payload = JSON.stringify(req.body);
    } else {
      payload = req.body;
    }
    const hmac = crypto.createHmac('sha256', process.env.CLOUDPAYMENTS_API_KEY);
    hmac.update(payload, 'utf8');
    return hmac.digest('base64');
}

module.exports = calculateHMAC;