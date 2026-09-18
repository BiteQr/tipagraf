/* =========================================================
   WELCOME SCREEN — фон (видео/фото), логотип, кнопки из JSON
   ========================================================= */
(function (App) {
  const { $, esc, safeUrl } = App.utils;
  const I18n = App.I18n;
  const root = $('#welcome');

  function renderBackground(s) {
    const imgEl = $('.welcome__img', root);
    const video = $('.welcome__video', root);

    if (s.bgImage) {
      imgEl.src = safeUrl(s.bgImage);
      imgEl.hidden = false;
      imgEl.onerror = () => { imgEl.hidden = true; };
    } else {
      imgEl.hidden = true;
    }

    const src = safeUrl(s.bgVideo);
    if (src && video.getAttribute('src') !== src) {
      video.src = src;
      if (s.bgImage) video.poster = safeUrl(s.bgImage);
      video.hidden = false;
      video.play().catch(() => { /* автоплей заблокирован — останется постер/фото */ });
    } else if (!src) {
      video.hidden = true;
    }
  }

  function renderLogo(s) {
    const center = $('.welcome__center', root);
    const logo = s.logoWelcome || s.logo;
    const old = $('.welcome__name', center);
    if (old) old.remove();

    const imgEl = $('.welcome__logo', center);
    if (logo) {
      imgEl.src = safeUrl(logo);
      imgEl.alt = s.name || '';
      imgEl.hidden = false;
    } else {
      imgEl.hidden = true;
      imgEl.insertAdjacentHTML('afterend', `<h1 class="welcome__name">${esc(s.name || '')}</h1>`);
    }
    $('.welcome__tagline', center).textContent = I18n.f(s, 'tagline');
  }

  function renderLangs() {
    $('.welcome__langs', root).innerHTML = I18n.langs.map((l) =>
      `<button type="button" data-lang="${l}" class="${l === I18n.lang ? 'is-active' : ''}">${I18n.WELCOME[l]}</button>`
    ).join('');
  }

  /** href для кнопки по её типу */
  function hrefOf(b) {
    const url = String(b.url ?? '').trim();
    switch (b.type) {
      case 'menu': return '#/menu';
      case 'tel': return 'tel:' + url.replace(/^tel:/i, '').replace(/[^\d+]/g, '');
      default: return safeUrl(url) || '#';
    }
  }

  function renderButtons(buttons) {
    // Если «половинчатых» кнопок нечётное число — последняя растягивается на всю ширину
    const half = buttons.filter((b) => !['primary', 'wide', 'text'].includes(b.style));
    const lastHalf = half.length % 2 ? half[half.length - 1] : null;

    $('.welcome__buttons', root).innerHTML = buttons.map((b) => {
      const style = ['primary', 'wide', 'text'].includes(b.style) ? b.style : (b === lastHalf ? 'wide' : 'outline');
      const external = b.type === 'link' && /^https?:/i.test(b.url || '');
      const attrs = [
        `class="wbtn wbtn--${style}"`,
        `href="${esc(hrefOf(b))}"`,
        external ? 'target="_blank" rel="noopener"' : '',
        b.type === 'menu' && b.url ? `data-open-cat="${esc(b.url)}"` : ''
      ].join(' ');
      return `<a ${attrs}>${esc(I18n.f(b, 'title'))}</a>`;
    }).join('');
  }

  function render(data) {
    const s = data.settings;
    renderBackground(s);
    renderLogo(s);
    renderLangs();
    renderButtons(data.buttons);
  }

  // Делегирование событий
  root.addEventListener('click', (e) => {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) { I18n.set(langBtn.dataset.lang); return; }

    const catLink = e.target.closest('[data-open-cat]');
    if (catLink) App.pendingCategory = catLink.dataset.openCat; // меню откроется на этой категории
  });

  App.Welcome = { render };
})(window.App);
