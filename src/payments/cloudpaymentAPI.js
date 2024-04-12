require('dotenv').config();
const axios = require('axios');
  
const apiClient = axios.create({
  baseURL: 'https://api.cloudpayments.ru',
  auth: {
    username: process.env.CLOUDPAYMENTS_API_ID,
    password: process.env.CLOUDPAYMENTS_API_KEY
  },
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

const subscriptionsCancel = async (Id) => {
  const data = { Id: Id };
  const response = await apiClient.post('/subscriptions/cancel', data);
  return response.data;
}

module.exports = {
  subscriptionsCancel,
}