require('dotenv').config();
const crypto = require('crypto');

function calculateHMAC(message) {
    const hmac = crypto.createHmac('sha256', process.env.CLOUDPAYMENTS_API_KEY);
    hmac.update(message, 'utf8');
    return hmac.digest('base64');
}

module.exports = calculateHMAC;