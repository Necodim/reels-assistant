const allowedIPs = [
  '91.142.84.0/27',
  '87.251.91.160/27',
  '162.55.174.97',
  '194.39.64.130',
  '92.63.206.131',
  '185.98.81.0/28'
];

const ip = require('ip');

const corsMiddleware = (req, res, next) => {
  const requestIP = req.ip;

  // Проверяем, попадает ли IP-адрес запроса в список разрешенных
  const isAllowed = allowedIPs.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // Если адрес представлен сетью
      return ip.cidrSubnet(allowedIP).contains(requestIP);
    } else {
      // Если адрес представлен одиночным IP
      return requestIP === allowedIP;
    }
  });

  if (!isAllowed) {
    return res.status(403).send('Access denied');
  }

  next();
};

module.exports = corsMiddleware;