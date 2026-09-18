/* =========================================================
   APP — загрузка данных, hash-роутер, смена языка
   Маршруты:  #/  → Welcome   |   #/menu → Меню   |   #/cart → Корзина поверх меню
   (hash-роутинг работает на GitHub Pages без настройки 404)
   ========================================================= */
(function (App) {
  const { $, overlay } = App.utils;
  const I18n = App.I18n;

  const screens = { welcome: $('#welcome'), menu: $('#menu') };
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let current = null;
  let previous = null;

  const parse = () => (location.hash.replace(/^#\/?/, '').split(/[?/]/)[0] || '');

  App.go = (hash) => {
    if (location.hash === hash || (hash === '#/' && !location.hash)) route();
    else location.hash = hash;
  };

  /** «Назад» внутри приложения: history.back(), если пришли из fallback-экрана, иначе прямой переход */
  App.back = (fallback) => {
    const target = fallback.replace(/^#\/?/, '').split(/[?/]/)[0] || '';
    if (previous === target) history.back();
    else location.replace(fallback);
  };

  function route() {
    const r = parse();
    const next = ['menu', 'cart'].includes(r) ? r : '';
    const wasWelcome = current === '' || current === null;

    overlay.closeAll();
    screens.welcome.hidden = next !== '';
    screens.menu.hidden = next === '';
    themeMeta.setAttribute('content', next === '' ? '#0e0e10' : '#ffffff');

    if (next === 'cart') App.CartView.open(); else App.CartView.close();

    if (next !== '' && wasWelcome) {
      window.scrollTo(0, 0);
      if (App.pendingCategory) {
        const cat = App.pendingCategory;
        App.pendingCategory = null;
        requestAnimationFrame(() => App.Menu.goToCategory(cat));
      }
    }
    if (next === 'menu') App.Menu.onScroll();

    previous = current;
    current = next;
  }

  function applyData(data) {
    App.data = data;
    if (data.settings.name) document.title = data.settings.name;
    App.Cart.setMenu(data.menuItems);
    App.Welcome.render(data);
    App.Menu.render(data);
    App.CartView.render();
  }

  function showError(err) {
    console.error(err);
    const box = $('.loader__error');
    $('.loader__spinner').hidden = true;
    box.hidden = false;
    box.innerHTML = `${I18n.t('loadError')}<br><button type="button">${I18n.t('retry')}</button>`;
    box.querySelector('button').onclick = () => location.reload();
  }

  async function init() {
    I18n.applyStatic();
    try {
      const data = await App.API.load((fresh) => applyData(fresh)); // фоновое обновление
      applyData(data);
    } catch (err) {
      showError(err);
      return;
    }

    I18n.onChange(() => {
      const y = window.scrollY;
      applyData(App.data);
      window.scrollTo(0, y);
    });

    window.addEventListener('hashchange', route);
    route();
    $('#loader').classList.add('is-done');
  }

  init();
})(window.App);
