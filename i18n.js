/* =========================================================
   I18N — строки интерфейса + выбор поля по языку (title_ru / title_kk / title_en)
   ========================================================= */
(function (App) {
  const C = window.APP_CONFIG;
  const { store } = App.utils;

  const DICT = {
    ru: {
      back: 'Назад', up: 'Наверх', cart: 'Корзина', close: 'Закрыть',
      search: 'Поиск', notFound: 'Ничего не нашлось. Попробуйте другое название.',
      cartTitle: 'Ваш заказ', total: 'Итого', positions: 'Позиций',
      order: 'Заказать', addToOrder: 'Добавить к заказу?',
      emptyCart: 'В заказе пока пусто', toMenu: 'Открыть меню',
      viewDish: 'Посмотреть блюдо', added: 'Добавлено в заказ',
      chooseVariant: 'Выберите вариант', byDefault: 'По умолчанию', from: 'от',
      remove: 'Удалить', orderSent: 'Заказ отправлен', orderFailed: 'Заказ не отправлен. Проверьте интернет и нажмите ещё раз.',
      orderMsgTitle: 'Новый заказ', loadError: 'Меню не загрузилось. Проверьте интернет.', retry: 'Повторить'
    },
    kk: {
      back: 'Артқа', up: 'Жоғары', cart: 'Себет', close: 'Жабу',
      search: 'Іздеу', notFound: 'Ештеңе табылмады. Басқа атауды жазып көріңіз.',
      cartTitle: 'Сіздің тапсырысыңыз', total: 'Барлығы', positions: 'Позиция',
      order: 'Тапсырыс беру', addToOrder: 'Тапсырысқа қосасыз ба?',
      emptyCart: 'Тапсырыс әзірге бос', toMenu: 'Мәзірді ашу',
      viewDish: 'Тағамды көру', added: 'Тапсырысқа қосылды',
      chooseVariant: 'Нұсқаны таңдаңыз', byDefault: 'Әдепкі', from: 'бастап',
      remove: 'Жою', orderSent: 'Тапсырыс жіберілді', orderFailed: 'Тапсырыс жіберілмеді. Интернетті тексеріп, қайта басыңыз.',
      orderMsgTitle: 'Жаңа тапсырыс', loadError: 'Мәзір жүктелмеді. Интернетті тексеріңіз.', retry: 'Қайталау'
    },
    en: {
      back: 'Back', up: 'Back to top', cart: 'Cart', close: 'Close',
      search: 'Search', notFound: 'Nothing found. Try another name.',
      cartTitle: 'Your order', total: 'Total', positions: 'Items',
      order: 'Place order', addToOrder: 'Add to your order?',
      emptyCart: 'Your order is empty', toMenu: 'Open menu',
      viewDish: 'View dish', added: 'Added to order',
      chooseVariant: 'Choose an option', byDefault: 'Default', from: 'from',
      remove: 'Remove', orderSent: 'Order sent', orderFailed: 'Order not sent. Check your connection and try again.',
      orderMsgTitle: 'New order', loadError: 'Menu failed to load. Check your connection.', retry: 'Retry'
    }
  };

  const SHORT = { ru: 'RU', kk: 'KZ', en: 'EN' };     // шапка меню
  const WELCOME = { ru: 'Рус', kk: 'Қаз', en: 'En' }; // главный экран
  const FULL = { ru: 'Русский', kk: 'Қазақша', en: 'English' };

  const listeners = [];
  let lang = store.get(C.LANG_KEY, C.DEFAULT_LANG);
  if (!C.LANGS.includes(lang)) lang = C.DEFAULT_LANG;
  document.documentElement.lang = lang;

  const I18n = {
    get lang() { return lang; },
    langs: C.LANGS, SHORT, WELCOME, FULL,

    set(next) {
      if (!C.LANGS.includes(next) || next === lang) return;
      lang = next;
      store.set(C.LANG_KEY, lang);
      document.documentElement.lang = lang;
      I18n.applyStatic();
      listeners.forEach((fn) => fn(lang));
    },

    /** Строка интерфейса */
    t(key) { return DICT[lang]?.[key] ?? DICT.ru[key] ?? key; },

    /** Поле данных на текущем языке с фолбэком на русский */
    f(obj, field) {
      if (!obj) return '';
      return obj[`${field}_${lang}`] || obj[`${field}_ru`] || obj[field] || '';
    },

    onChange(fn) { listeners.push(fn); },

    /** Статичные элементы с data-i18n / data-i18n-aria */
    applyStatic() {
      document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = I18n.t(el.dataset.i18n); });
      document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', I18n.t(el.dataset.i18nAria)); });
      const input = document.getElementById('searchInput');
      if (input) input.placeholder = I18n.t('search');
    }
  };

  App.I18n = I18n;
})(window.App);
