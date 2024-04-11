const language = 'ru-RU'
const tg = window.Telegram.WebApp;

const getPaymentData = () => {
  const urlParams = new URLSearchParams(tg.initData);
  const amount = urlParams.get('amount');
  const name = urlParams.get('name');
  document.getElementById('payment-amount').innerHTML = amount;
  document.getElementById('payment-name').innerHTML = name;
  const data = {
    amount: amount,
    name: name
  }
  return data;
}

const pay = (data) => {
  var widget = new cp.CloudPayments({
    language: language
  })
  widget.pay('charge',
    {
      publicId: 'pk_edf0062f62cf19ad99627da61c2e7',
      description: data.payment.name,
      amount: data.payment.amount,
      currency: 'RUB',
      accountId: data.user.chatId,
      skin: 'mini',
      autoClose: 3,
      data: {
        telegramId: data.user.chatId
      },
      // configuration: {
      //     common: {
      //         successRedirectUrl: 'https://api.reelsassistant.ru/cloudpayments/success',
      //         failRedirectUrl: 'https://api.reelsassistant.ru/cloudpayments/fail'
      //     }
      // },
      payer: {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      }
    }, {
    onSuccess: function (options) {
      tg.close();
    },
    onFail: function (reason, options) { // fail
      //действие при неуспешной оплате
    },
    onComplete: function (paymentResult, options) { //Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
      //например вызов вашей аналитики Facebook Pixel
    }
  }
  )
}

document.addEventListener('DOMContentLoaded', () => {
  if (!!tg) {
    tg.ready()
    tg.expand();

    if (!!tg.initDataUnsafe?.user?.firstName) {
      document.getElementById('firstName').closest('.input-block').remove();
      data.user.firstName = tg.initDataUnsafe?.user?.firstName;
    }
    if (!!tg.initDataUnsafe?.user?.lastName) {
      document.getElementById('lastName').closest('.input-block').remove();
      datauser.lastName = tg.initDataUnsafe?.user?.lastName;
    }

    document.getElementById('request-phone').addEventListener('click', () => {
      try {
        const contact = tg.requestContact((contact) => {
          const phoneNumber = contact.phoneNumber;
          const data = {
            payment: getPaymentData(),
            user: {
              chatId: tg.initDataUnsafe?.user?.id,
              firstName: tg.initDataUnsafe?.user?.firstName,
              lastName: tg.initDataUnsafe?.user?.lastName,
              phone: phoneNumber
            }
          }
          pay(data);
        });
        console.log(contact);
      } catch (error) {
        console.error(error);
      }
    });
  } else {
    document.querySelector('#firstName').addEventListener('input', (e) => {
      data.user.firstName = e.target.value;
    });
    document.querySelector('#lastName').addEventListener('input', (e) => {
      data.user.lastName = e.target.value;
    });
  }

  const form = document.getElementById('paymentForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const phoneInput = document.getElementById('phone');
    const phoneNumber = phoneInput.value;
    const data = {
      payment: getPaymentData(),
      user: {
        chatId: tg.initDataUnsafe?.user?.id,
        firstName: tg.initDataUnsafe?.user?.firstName,
        lastName: tg.initDataUnsafe?.user?.lastName,
        phone: phoneNumber
      }
    }
    pay(data);
  });
});