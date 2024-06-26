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
        vat: 0, // НДС
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
      configuration: {
        common: {
          successRedirectUrl: 'https://api.reelsassistant.ru/payment/success',
          failRedirectUrl: 'https://api.reelsassistant.ru/payment/fail'
        }
      },
      payer: {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      }
    }, {
    onSuccess: function (options) {
      window.location.replace('https://api.reelsassistant.ru/success');
    },
    onFail: function (reason, options) {
      window.location.replace('https://api.reelsassistant.ru/fail');
    },
    onComplete: function (paymentResult, options) { //Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
      //например вызов вашей аналитики Facebook Pixel
    }
  }
  )
}

const validateName = (input, type) => {
  const name = input.value;
  const regex = /^[a-zA-Zа-яА-ЯёЁüÜöÖäÄß\s'-]+$/;
  if (!name) {
    const text = type === 'name' ? 'Имя не может быть пустым.' : 'Фамилия не может быть пустой.';
    return { valid: false, message: text };
  }
  if (name.length > 50) {
    const text = type === 'name' ? 'Имя не должно превышать 50 символов.' : 'Фамилия не должна превышать 50 символов.';
    return { valid: false, message: text };
  }
  if (!regex.test(name)) {
    const text = type === 'name' ? 'Имя содержит недопустимые символы.' : 'Фамилия содержит недопустимые символы.';
    return { valid: false, message: text };
  }
  const text = type === 'name' ? 'Имя валидно.' : 'Фамилия валидна.';
  return { valid: true, message: text };
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

document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  const form = document.getElementById('paymentForm');
  const submit = form.querySelector('[type="submit"]');
  const container = document.querySelector('.container');
  const textInputs = form.querySelectorAll('input[type="text"], input[type="tel"]');
  const inputFirstName = document.getElementById('firstName');
  const inputLastName = document.getElementById('lastName');
  const inputPhone = document.getElementById('phone');
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');

  const setPaymentData = () => {
    const data = getPaymentData();
    document.querySelectorAll('[name="payment-amount"]').forEach(el => el.innerHTML = data.amount);
    document.querySelectorAll('[name="payment-name"]').forEach(el => el.innerHTML = data.name);
  }

  const getPaymentData = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const name = urlParams.get('name');
    // const token = urlParams.get('token');
    const data = {
      amount: parseInt(amount, 10),
      name: name,
      // token: token
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

  let pageHeight = 0;
  const findHighestNode = (nodesList) => {
    for (var i = nodesList.length - 1; i >= 0; i--) {
      if (nodesList[i].scrollHeight && nodesList[i].clientHeight) {
        var elHeight = Math.max(nodesList[i].scrollHeight, nodesList[i].clientHeight);
        pageHeight = Math.max(elHeight, pageHeight);
      }
      if (nodesList[i].childNodes.length) findHighestNode(nodesList[i].childNodes);
    }
  }
  findHighestNode(document.documentElement.childNodes);

  inputFirstName.value = getUserData().firstName;
  inputLastName.value = getUserData().lastName;

  textInputs.forEach(input => {
    input.addEventListener('focus', () => {
      container.style.height = (pageHeight + 275) + 'px';
    });
    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement.tagName.toLocaleLowerCase() !== 'input') {
          container.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            container.style.height = pageHeight + 'px';
            setTimeout(() => {
              container.style.height = '';
            }, 100);
          }, 100);
        }
      }, 100);
    });
  });

  inputPhone.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^\d+]/g, '');
    if (value === '') {
      value = '';
    } else if (value.startsWith('8') || value.startsWith('7') && !value.startsWith('+7')) {
      value = '+7' + value.substring(1);
    } else if (!value.startsWith('+')) {
      value = '+' + value;
    }
    e.target.value = value;
  });

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('input', (e) => {
      const customCb = e.target.parentNode.querySelector('.checkbox-box');
      customCb.setAttribute('aria-checked', e.target.checked);
    });
  });

  document.addEventListener('click', function (event) {
    const inputs = document.querySelectorAll('.container input');
    const labels = document.querySelectorAll('.container label');
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

  const submitForm = (event) => {
    event.preventDefault();

    if (!validateName(inputFirstName, 'name').valid && !validateName(inputLastName, 'surname').valid && !validatePhone(inputPhone).valid) {
      tg.showAlert('Заполните все поля формы. Это необходимо для проведения платежа.');
      return false;
    } else if (!validateName(inputFirstName, 'name').valid) {
      tg.showAlert(validateName(inputFirstName, 'name').message, () => inputFirstName.focus());
      return false;
    } else if (!validateName(inputLastName, 'surname').valid) {
      tg.showAlert(validateName(inputLastName, 'surname').message, () => inputLastName.focus());
      return false;
    } else if (!validatePhone(inputPhone).valid) {
      tg.showAlert(validatePhone(inputPhone).message, () => inputPhone.focus());
      return false;
    }

    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].required && !checkboxes[i].checked) {
        event.preventDefault();
        document.querySelector('.checkbox-box[tabindex="0"]').focus();
        const text = checkboxes[i].name === 'agreement-offer' ? 'Для оформления подписки необходимо подтвердить, что вы ознакомились с офертой и даёте своё согласие на обработку персональных данных.' : 'Для оформления подписки необходимо ознакомиться со стоиость подписки и периодичностью списания и дать своё согласие.';
        tg.showAlert(text);
        return false;
      }
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
  }

  submit.addEventListener('click', (e) => {
    e.preventDefault();
    submitForm(e);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm(e);
  });
});