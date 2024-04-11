const pay = (data, tg) => {
  var widget = new cp.CloudPayments({
    language: 'ru-RU'
  });

  const receipt = {
    Items: [
         {
            label: 'Подписка: ' + data.payment.name,
            price: data.payment.amount,
            quantity: 1.00,
            amount: data.payment.amount,
            vat: 20,
            method: 0, // тег-1214 признак способа расчета - признак способа расчета
            object: 0, // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
        }
    ],
    taxationSystem: 0,
    phone: data.user.phone,
    isBso: false,
    amounts:
    {
        electronic: data.payment.amount, // Сумма оплаты электронными деньгами
        advancePayment: 0.00, // Сумма из предоплаты (зачетом аванса) (2 знака после точки)
        credit: 0.00, // Сумма постоплатой(в кредит) (2 знака после точки)
        provision: 0.00 // Сумма оплаты встречным предоставлением (сертификаты, др. мат.ценности) (2 знака после точки)
    }
};

  widget.pay('charge',
    {
      publicId: 'pk_edf0062f62cf19ad99627da61c2e7',
      description: data.payment.name,
      amount: data.payment.amount,
      currency: 'RUB',
      accountId: data.user.id,
      skin: data.theme,
      autoClose: 3,
      data: {
        CloudPayments: {
          CustomerReceipt: receipt,
          recurrent: {
           interval: 'Month',
           period: 1, 
           customerReceipt: receipt
          }
        },
        telegram: data.user.id
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
    onFail: function (reason, options) {
      //действие при неуспешной оплате
    },
    onComplete: function (paymentResult, options) { //Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
      //например вызов вашей аналитики Facebook Pixel
    }
  }
  )
}

const validateName = (name) => {
  const regex = /^[a-zA-Zа-яА-ЯёЁüÜöÖäÄß\s'-]+$/;
  if (!name) {
      return { valid: false, message: 'Имя не может быть пустым.' };
  }
  if (name.length > 50) {
      return { valid: false, message: 'Имя не должно превышать 50 символов.' };
  }
  if (!regex.test(name)) {
      return { valid: false, message: 'Имя содержит недопустимые символы.' };
  }
  return { valid: true, message: 'Имя валидно.' };
}

const validateSurname = (name) => {
  const regex = /^[a-zA-Zа-яА-ЯёЁüÜöÖäÄß\s'-]+$/;
  if (!name) {
      return { valid: false, message: 'Фамилия не может быть пустой.' };
  }
  if (name.length > 50) {
      return { valid: false, message: 'Фамилия не должна превышать 50 символов.' };
  }
  if (!regex.test(name)) {
      return { valid: false, message: 'Фамилия содержит недопустимые символы.' };
  }
  return { valid: true, message: 'Фамилия валидна.' };
}

const validatePhone = (phoneNumber) => {
  const regex = /^\+[1-9]\d{6,14}$/;
  if (!phoneNumber) {
      return { valid: false, message: 'Номер телефона не может быть пустым.' };
  }
  if (phoneNumber.length < 8) {
      return { valid: false, message: 'Номер телефона должен содержать хотя бы 8 символов, включая знак +.' };
  }
  if (phoneNumber.length > 16) {
      return { valid: false, message: 'Номер телефона не должен превышать 16 символов, включая знак +.' };
  }
  if (!regex.test(phoneNumber)) {
      return { valid: false, message: 'Номер телефона должен быть в международном формате, начиная с '+', за которым следуют от 7 до 15 цифр.' };
  }
  return { valid: true, message: 'Номер телефона валиден.' };
}

document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;

  const setPaymentData = () => {
    const data = getPaymentData();
    document.getElementById('payment-amount').innerHTML = data.amount;
    document.getElementById('payment-name').innerHTML = data.name;
  }

  const getPaymentData = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const name = urlParams.get('name');
    const data = {
      amount: parseInt(amount, 10),
      name: name
    }
    return data;
  }

  const getUserData = () => {
    const initData = new URLSearchParams(tg.initData);
    const user = JSON.parse(initData.get('user'));
    const data = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: ''
    }
    return data;
  }

  setPaymentData();

  tg.ready()
  tg.expand();
  tg.enableClosingConfirmation();
  document.getElementById('firstName').value = getUserData().firstName;
  document.getElementById('lastName').value = getUserData().lastName;
  
  const form = document.getElementById('paymentForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputFirstName = document.getElementById('firstName');
    const inputLastName = document.getElementById('lastName');
    const inputPhone = document.getElementById('phone');
    inputPhone.addEventListener('input', (e) => e.target.value = e.target.value.replace(/[^\d+]/g, ''));

    if (!validateName(inputFirstName.value).valid && !validateSurname(inputLastName.value).valid && !validatePhone(inputPhone.value).valid) {
      tg.showAlert('Заполните все поля формы. Это необходимо для проведения платежа.');
      return false;
    } else if (!validateName(inputFirstName.value).valid) {
      tg.showAlert(validateName(inputFirstName.value).message, () => inputFirstName.focus());
      return false;
    } else if (!validateSurname(inputLastName.value).valid) {
      tg.showAlert(validateSurname(inputLastName.message), () => inputLastName.focus());
      return false;
    } else if (!validatePhone(inputPhone.value).valid) {
      tg.showAlert(validatePhone(inputPhone.value).message, () => inputPhone.focus());
      return false;
    }

    const data = {
      payment: getPaymentData(),
      user: {
        chatId: getUserData().id,
        firstName: inputFirstName.value,
        lastName: inputLastName.value,
        phone: inputPhone.value
      },
      theme: tg.colorScheme === 'dark' ? 'modern' : 'mini'
    }
    pay(data, tg);
  });
});