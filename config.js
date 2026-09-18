/* =========================================================
   CONFIG — единственный файл, который нужно править при деплое
   ========================================================= */
window.APP_CONFIG = {
  // URL веб-приложения Google Apps Script (заканчивается на /exec).
  // Пусто → используются мок-данные из js/mock-data.js
  API_URL: 'https://script.google.com/macros/s/AKfycbxkEopUs9wwGDUueATnbDI-tIp1B1wORxlGPcAWw0YhBqJqMBXAFfUfcUYWhfq5bAEF/exec',

  // Куда отправлять заказ POST-запросом (обычно тот же URL /exec).
  // Пусто → заказ не пишется в таблицу, только WhatsApp.
  ORDER_ENDPOINT: '',

  // Номер WhatsApp для заказов (только цифры). Можно переопределить в листе Settings (ключ whatsapp).
  WHATSAPP: '77001234567',

  CURRENCY: '₸',

  // Порядок в строке вариации:
  // 'price-first' → «850 ₸ ........ 30 мл» (как на скриншотах)
  // 'label-first' → «30 мл ........ 850 ₸»
  VARIANT_ORDER: 'price-first',

  LANGS: ['ru', 'kk', 'en'],
  DEFAULT_LANG: 'ru',

  // Ключи localStorage
  CART_KEY: 'menu_cart_v1',
  LANG_KEY: 'menu_lang_v1',
  DATA_CACHE_KEY: 'menu_data_v1'
};
