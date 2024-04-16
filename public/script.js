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
      accountId: String(data.user.id),
      skin: data.theme,
      autoClose: 3,
      data: {
        CloudPayments: {
          telegram: data.user.id,
          CustomerReceipt: receipt,
          recurrent: {
            interval: 'Month',
            period: 1,
            customerReceipt: receipt
          }
        }
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

const validateName = (input) => {
  const name = input.value;
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

const validateSurname = (input) => {
  const name = input.value;
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

const validatePhone = (input) => {
  const phoneNumber = input.value;
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
    return { valid: false, message: 'Номер телефона должен быть в международном формате, начиная с ' + ', за которым следуют от 7 до 15 цифр.' };
  }
  return { valid: true, message: 'Номер телефона валиден.' };
}

const validateCheckbox = (input) => {
  console.log(input)
  console.log(input.checked)
  if (!input.checked) {
    return { valid: false, message: 'Для оформления подписки необходимо дать своё согласие.' };
  } else {
    return { valid: true, message: 'Поле заполнено.' };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  const form = document.getElementById('paymentForm');
  const inputFirstName = document.getElementById('firstName');
  const inputLastName = document.getElementById('lastName');
  const inputPhone = document.getElementById('phone');
  const checkboxOffer = document.getElementById('agreement-offer');
  const checkboxSubscription = document.getElementById('agreement-subscription');

  const setPaymentData = () => {
    const data = getPaymentData();
    document.querySelectorAll('[name="payment-amount"]').forEach(el => el.innerHTML = data.amount);
    document.querySelectorAll('[name="payment-name"]').forEach(el => el.innerHTML = data.name);
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
  tg.BackButton.hide();

  inputFirstName.value = getUserData().firstName;
  inputLastName.value = getUserData().lastName;


  inputPhone.addEventListener('input', (e) => e.target.value = e.target.value.replace(/[^\d+]/g, ''));
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('input', (e) => {
      const customCb = e.target.parentNode.querySelector('.checkbox-box');
      customCb.setAttribute('aria-checked', e.target.checked);
    });
  });

  document.addEventListener('click', function (event) {
    const inputs = document.querySelectorAll('.form-wrapper input');
    const labels = document.querySelectorAll('.form-wrapper label');
    let isClickedInside = false;
    inputs.forEach(input => {
      if (input.contains(event.target)) {
        isClickedInside = true;
      }
    });
    labels.forEach(label => {
      if (label.contains(event.target)) {
        isClickedInside = true;
      }
    });
    if (!isClickedInside) {
      inputs.forEach(input => {
        input.blur();
      });
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log(event);

    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].required && !checkboxes[i].checked) {
        event.preventDefault();
        document.querySelector('.checkbox-box[tabindex="0"]').focus();
        tg.showAlert('Для оформления подписки необходимо дать своё согласие.');
        break;
      }
    }

    if (!validateName(inputFirstName).valid && !validateSurname(inputLastName).valid && !validatePhone(inputPhone).valid) {
      tg.showAlert('Заполните все поля формы. Это необходимо для проведения платежа.');
      return false;
    } else if (!validateName(inputFirstName).valid) {
      tg.showAlert(validateName(inputFirstName).message, () => inputFirstName.focus());
      return false;
    } else if (!validateSurname(inputLastName).valid) {
      tg.showAlert(validateSurname(inputLastName.message), () => inputLastName.focus());
      return false;
    } else if (!validatePhone(inputPhone).valid) {
      tg.showAlert(validatePhone(inputPhone).message, () => inputPhone.focus());
      return false;
    }

    const data = {
      payment: getPaymentData(),
      user: {
        id: getUserData().id,
        firstName: inputFirstName.value,
        lastName: inputLastName.value,
        phone: inputPhone.value
      },
      theme: tg.colorScheme === 'dark' ? 'modern' : 'mini'
    }
    pay(data, tg);
  });
});