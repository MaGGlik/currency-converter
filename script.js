const currencyList = [
  { code: 'RUB', name: 'Российский рубль', flag: '🇷🇺' },
  { code: 'USD', name: 'Доллар США', flag: '🇺🇸' },
  { code: 'EUR', name: 'Евро', flag: '🇪🇺' },
  { code: 'GBP', name: 'Фунт стерлингов', flag: '🇬🇧' },
  { code: 'CNY', name: 'Китайский юань', flag: '🇨🇳' },
  { code: 'JPY', name: 'Японская йена', flag: '🇯🇵' },
  { code: 'KZT', name: 'Казахстанский тенге', flag: '🇰🇿' },
  { code: 'BYN', name: 'Белорусский рубль', flag: '🇧🇾' },
  { code: 'UAH', name: 'Украинская гривна', flag: '🇺🇦' },
  { code: 'TRY', name: 'Турецкая лира', flag: '🇹🇷' },
  { code: 'CHF', name: 'Швейцарский франк', flag: '🇨🇭' },
  { code: 'CAD', name: 'Канадский доллар', flag: '🇨🇦' },
  { code: 'AUD', name: 'Австралийский доллар', flag: '🇦🇺' },
  { code: 'INR', name: 'Индийская рупия', flag: '🇮🇳' },
  { code: 'BRL', name: 'Бразильский реал', flag: '🇧🇷' },
  { code: 'KRW', name: 'Южнокорейская вона', flag: '🇰🇷' },
  { code: 'AED', name: 'Дирхам ОАЭ', flag: '🇦🇪' },
  { code: 'PLN', name: 'Польский злотый', flag: '🇵🇱' },
  { code: 'CZK', name: 'Чешская крона', flag: '🇨🇿' },
  { code: 'SEK', name: 'Шведская крона', flag: '🇸🇪' }
];

let currentRates = {};
let updatedAt = null;

function initSelects() {
  const from = document.getElementById('from-currency');
  const to = document.getElementById('to-currency');

  from.innerHTML = '';
  to.innerHTML = '';

  currencyList.forEach(item => {
    const opt1 = document.createElement('option');
    opt1.value = item.code;
    opt1.textContent = item.flag + ' ' + item.code + ' — ' + item.name;
    from.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = item.code;
    opt2.textContent = item.flag + ' ' + item.code + ' — ' + item.name;
    to.appendChild(opt2);
  });

  from.value = localStorage.getItem('from_currency') || 'USD';
  to.value = localStorage.getItem('to_currency') || 'RUB';
}

async function fetchRates() {
  try {
    const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const data = await res.json();

    currentRates = { RUB: 1 };

    for (const key in data.Valute) {
      const item = data.Valute[key];
      currentRates[key] = item.Value / item.Nominal;
    }

    updatedAt = new Date();
    renderAll();
  } catch (e) {
    document.getElementById('rate-info').textContent = 'Не удалось загрузить курсы';
  }
}

function convert() {
  const fromCode = document.getElementById('from-currency').value;
  const toCode = document.getElementById('to-currency').value;
  const amount = parseFloat(document.getElementById('from-amount').value) || 0;

  localStorage.setItem('from_currency', fromCode);
  localStorage.setItem('to_currency', toCode);

  if (!currentRates[fromCode] || !currentRates[toCode]) {
    document.getElementById('to-amount').value = '0';
    return;
  }

  const rubles = amount * currentRates[fromCode];
  const result = rubles / currentRates[toCode];

  document.getElementById('to-amount').value = result.toFixed(2);

  const pairRate = currentRates[fromCode] / currentRates[toCode];
  document.getElementById('rate-info').textContent =
    '1 ' + fromCode + ' = ' + pairRate.toFixed(4) + ' ' + toCode;
}

function renderRates() {
  const box = document.getElementById('all-rates');
  box.innerHTML = '';

  const popular = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'KZT', 'BYN', 'TRY', 'CHF', 'AED'];

  popular.forEach(code => {
    if (currentRates[code]) {
      const found = currencyList.find(c => c.code === code);
      const div = document.createElement('div');
      div.className = 'rate-item';
      div.innerHTML =
        '<span class="code">' + (found ? found.flag : '') + ' ' + code + '</span>' +
        '<span class="value">' + currentRates[code].toFixed(2) + ' ₽</span>';
      box.appendChild(div);
    }
  });
}

function renderAll() {
  convert();
  renderRates();

  if (updatedAt) {
    document.getElementById('update-time').textContent =
      'Обновлено: ' + updatedAt.toLocaleString('ru-RU');
  }
}

function swapCurrencies() {
  const from = document.getElementById('from-currency');
  const to = document.getElementById('to-currency');

  const tmp = from.value;
  from.value = to.value;
  to.value = tmp;

  convert();
}

document.addEventListener('DOMContentLoaded', function () {
  initSelects();

  document.getElementById('from-amount').addEventListener('input', convert);
  document.getElementById('from-currency').addEventListener('change', convert);
  document.getElementById('to-currency').addEventListener('change', convert);

  fetchRates();

  setInterval(fetchRates, 5 * 60 * 1000);
});