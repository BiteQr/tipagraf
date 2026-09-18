/* =========================================================
   MENU PAGE — акции, поиск, категории, пилюли разделов, блюда
   ========================================================= */
(function (App) {
  const C = window.APP_CONFIG;
  const { $, $$, esc, money, norm, debounce, img, toast, bump, overlay, safeUrl } = App.utils;
  const I18n = App.I18n;
  const Cart = App.Cart;

  const root = $('#menu');
  const main = $('.menu__main', root);
  const els = {
    topbar: $('.topbar', root),
    logo: $('.topbar__logo', root),
    brand: $('.topbar__brand', root),
    langBtn: $('.lang__btn', root),
    langCur: $('.lang__current', root),
    langList: $('.lang__list', root),
    promos: $('#promos'),
    search: $('#searchInput'),
    searchClear: $('[data-action="clear-search"]', root),
    cats: $('#cats'),
    pills: $('#pills'),
    sections: $('#sections'),
    notFound: $('#notFound'),
    fabTop: $('.fab-top', root),
    fabCart: $('.fab-cart', root),
    promoModal: $('#promoModal'),
    variantSheet: $('#variantSheet')
  };

  let data = null;
  let sectionEls = [];          // DOM-узлы разделов в порядке отображения
  let activeSec = null;
  let activeCat = null;
  let spyLockUntil = 0;         // пауза scroll-spy во время программного скролла

  /* ---------------------------------------------------------
     RENDER: шапка
     --------------------------------------------------------- */
  function renderHeader() {
    const s = data.settings;
    const logo = s.logoHeader || s.logo;
    const oldName = $('.topbar__name', els.brand);
    if (oldName) oldName.remove();
    if (logo) {
      els.logo.src = safeUrl(logo);
      els.logo.alt = s.name || '';
      els.logo.hidden = false;
    } else {
      els.logo.hidden = true;
      els.brand.insertAdjacentHTML('beforeend', `<span class="topbar__name">${esc(s.name || '')}</span>`);
    }
    els.langCur.textContent = I18n.SHORT[I18n.lang];
    els.langList.innerHTML = I18n.langs.map((l) =>
      `<button type="button" role="menuitem" data-lang="${l}" class="${l === I18n.lang ? 'is-active' : ''}">
         <span>${I18n.FULL[l]}</span><span>${I18n.SHORT[l]}</span>
       </button>`).join('');
  }

  /* ---------------------------------------------------------
     RENDER: акции
     --------------------------------------------------------- */
  function renderPromos() {
    els.promos.hidden = !data.promos.length;
    els.promos.innerHTML = data.promos.map((p, i) =>
      `<button type="button" class="promo" data-promo="${i}" aria-label="${esc(I18n.f(p, 'title'))}">
         ${img(p.image, '', I18n.f(p, 'title'), i < 2)}
       </button>`).join('');
  }

  function openPromo(i) {
    const p = data.promos[i];
    if (!p) return;
    const item = p.itemId ? Cart.getItem(String(p.itemId)) : null;
    const title = I18n.f(p, 'title');
    const desc = I18n.f(p, 'description');
    $('.overlay__content', els.promoModal).innerHTML = `
      ${img(p.image, 'promo-full__img', title, true)}
      <div class="promo-full__body">
        ${title ? `<h3 class="promo-full__title">${esc(title)}</h3>` : ''}
        ${desc ? `<p class="promo-full__desc">${esc(desc)}</p>` : ''}
        ${item ? `<button type="button" class="promo-full__btn" data-goto-item="${esc(item.id)}">${esc(I18n.f(p, 'button') || I18n.t('viewDish'))}</button>` : ''}
      </div>`;
    overlay.open(els.promoModal);
  }

  /* ---------------------------------------------------------
     RENDER: категории + пилюли + разделы
     --------------------------------------------------------- */
  /** Группируем: категория → разделы → блюда. Пустые разделы не показываем. */
  function buildTree() {
    const itemsBySec = new Map();
    data.menuItems.forEach((it) => {
      if (!itemsBySec.has(it.sectionId)) itemsBySec.set(it.sectionId, []);
      itemsBySec.get(it.sectionId).push(it);
    });

    const withItems = (s) => (itemsBySec.get(s.id) || []).length > 0;
    const catIds = new Set(data.categories.map((c) => c.id));

    const tree = data.categories.map((cat) => ({
      cat,
      sections: data.sections.filter((s) => s.categoryId === cat.id && withItems(s))
    })).filter((g) => g.sections.length);

    // Разделы без категории — в конец
    const orphans = data.sections.filter((s) => !catIds.has(s.categoryId) && withItems(s));
    if (orphans.length) tree.push({ cat: null, sections: orphans });

    return { tree, itemsBySec };
  }

  function variantHTML(v) {
    const price = `<span>${money(v.price)}</span>`;
    const label = `<span>${esc(v.label)}</span>`;
    const dots = '<span class="variant__dots"></span>';
    if (!v.label) return `<div class="variant">${price}</div>`;
    return `<div class="variant">${C.VARIANT_ORDER === 'label-first' ? label + dots + price : price + dots + label}</div>`;
  }

  function itemHTML(it, secTitle = '') {
    const title = I18n.f(it, 'title');
    const desc = I18n.f(it, 'description');
    const hasVariants = it.variants.length > 0;
    // Ищем по названию (на всех языках), описанию и названию раздела («пицца» найдёт весь раздел)
    const searchStr = norm(`${title} ${desc} ${it.title_ru || ''} ${it.title_en || ''} ${it.title_kk || ''} ${secTitle}`);

    return `
      <article class="item ${it.image ? '' : 'item--noimg'}" id="item-${esc(it.id)}" data-search="${esc(searchStr)}">
        ${it.image ? img(it.image, 'item__img', title) : ''}
        <div class="item__body">
          <h3 class="item__title">${esc(title)}</h3>
          ${desc ? `<p class="item__desc">${esc(desc)}</p>` : ''}
          ${hasVariants ? `<div class="variants">${it.variants.map(variantHTML).join('')}</div>` : ''}
          <div class="item__foot">
            ${!hasVariants && it.price ? `<span class="item__price">${money(it.price)}</span>` : ''}
            <button type="button" class="add-btn" data-add="${esc(it.id)}" aria-label="+ ${esc(title)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderBody() {
    const { tree, itemsBySec } = buildTree();

    els.cats.hidden = tree.filter((g) => g.cat).length < 2;
    els.cats.innerHTML = tree.filter((g) => g.cat).map(({ cat }) =>
      `<button type="button" class="cat" data-cat="${esc(cat.id)}">
         ${img(cat.image, 'cat__img', I18n.f(cat, 'title'), true)}
         <span class="cat__title">${esc(I18n.f(cat, 'title'))}</span>
       </button>`).join('');

    els.pills.innerHTML = tree.flatMap((g) => g.sections).map((s) =>
      `<button type="button" class="pill" data-sec="${esc(s.id)}">${esc(I18n.f(s, 'title'))}</button>`
    ).join('');

    els.sections.innerHTML = tree.map((g) =>
      g.sections.map((s) => {
        const sub = I18n.f(s, 'subtitle');
        return `
          <section class="section" id="sec-${esc(s.id)}" data-sec="${esc(s.id)}" data-cat="${esc(g.cat ? g.cat.id : '')}">
            <h2 class="section__title">${esc(I18n.f(s, 'title'))}</h2>
            ${sub ? `<p class="section__sub">${esc(sub)}</p>` : ''}
            <div class="items">${itemsBySec.get(s.id).map((it) => itemHTML(it, I18n.f(s, 'title'))).join('')}</div>
          </section>`;
      }).join('')
    ).join('');

    sectionEls = $$('.section', els.sections);
    activeSec = activeCat = null;
    applySearch();
    updateBadges();
    onScroll();
  }

  function render(d) {
    data = d;
    renderHeader();
    renderPromos();
    renderBody();
    I18n.applyStatic();
  }

  /* ---------------------------------------------------------
     СКРОЛЛ: навигация и scroll-spy
     --------------------------------------------------------- */
  const stickyOffset = () => els.topbar.offsetHeight + els.pills.offsetHeight + 8;

  function scrollToEl(el, smooth = true) {
    const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset();
    spyLockUntil = Date.now() + 900;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
  }

  /** Горизонтально подкрутить ленту, чтобы элемент был виден */
  function centerInRow(row, el) {
    if (!row || !el) return;
    const left = el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }

  function setActive(secEl) {
    const secId = secEl ? secEl.dataset.sec : null;
    const catId = secEl ? secEl.dataset.cat : null;

    if (secId !== activeSec) {
      activeSec = secId;
      $$('.pill', els.pills).forEach((p) => p.classList.toggle('is-active', p.dataset.sec === secId));
      centerInRow(els.pills, $(`.pill.is-active`, els.pills));
    }
    if (catId !== activeCat) {
      activeCat = catId;
      $$('.cat', els.cats).forEach((c) => c.classList.toggle('is-active', c.dataset.cat === catId));
      centerInRow(els.cats, $('.cat.is-active', els.cats));
    }
  }

  function onScroll() {
    if (root.hidden) return;
    els.fabTop.classList.toggle('is-hidden', window.scrollY < 500);
    if (Date.now() < spyLockUntil) return;

    const visible = sectionEls.filter((s) => !s.hidden);
    const offset = stickyOffset() + 24;
    let current = visible[0] || null;
    for (const s of visible) {
      if (s.getBoundingClientRect().top - offset <= 0) current = s; else break;
    }
    // В самом низу страницы — активен последний раздел
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && visible.length) {
      current = visible[visible.length - 1];
    }
    setActive(current);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });

  function goToSection(secId) {
    const el = document.getElementById('sec-' + secId);
    if (!el) return;
    setActive(el);
    scrollToEl(el);
  }

  function goToCategory(catId) {
    const el = sectionEls.find((s) => s.dataset.cat === catId && !s.hidden);
    if (!el) return;
    setActive(el);
    scrollToEl(el);
  }

  function goToItem(id) {
    if (els.search.value) { els.search.value = ''; applySearch(); }
    const el = document.getElementById('item-' + id);
    if (!el) return;
    scrollToEl(el);
    bump(el, 'flash');
  }

  /* ---------------------------------------------------------
     ПОИСК
     --------------------------------------------------------- */
  function applySearch() {
    const q = norm(els.search.value);
    els.searchClear.hidden = !q;
    main.classList.toggle('is-searching', !!q);

    let found = 0;
    sectionEls.forEach((sec) => {
      let secFound = 0;
      $$('.item', sec).forEach((it) => {
        const ok = !q || it.dataset.search.includes(q);
        it.hidden = !ok;
        if (ok) secFound++;
      });
      sec.hidden = secFound === 0;
      found += secFound;
      const pill = $(`.pill[data-sec="${CSS.escape(sec.dataset.sec)}"]`, els.pills);
      if (pill) pill.hidden = sec.hidden;
    });

    els.notFound.hidden = found > 0;
    els.notFound.textContent = I18n.t('notFound');
    activeSec = null;
    onScroll();
  }

  /* ---------------------------------------------------------
     ДОБАВЛЕНИЕ В КОРЗИНУ (общий обработчик, используется и корзиной)
     --------------------------------------------------------- */
  function handleAdd(id, sourceBtn) {
    const item = Cart.getItem(id);
    if (!item) return;
    if (item.variants.length > 1) { openVariantSheet(item); return; }
    Cart.add(id, item.variants.length === 1 ? 0 : -1);
    bump(sourceBtn);
    toast(I18n.t('added'));
  }

  function openVariantSheet(item) {
    const title = I18n.f(item, 'title');
    $('.overlay__content', els.variantSheet).innerHTML = `
      <div class="sheet__head">
        <h3 class="sheet__title">${esc(title)}</h3>
        <p class="sheet__sub">${esc(I18n.t('chooseVariant'))}</p>
      </div>
      <div class="sheet__list">
        ${item.variants.map((v, i) => `
          <button type="button" class="sheet__opt" data-pick="${esc(item.id)}" data-v="${i}">
            <span>${esc(v.label || I18n.t('byDefault'))}</span>
            <span class="variant__dots"></span>
            <span>${money(v.price)}</span>
          </button>`).join('')}
      </div>`;
    overlay.open(els.variantSheet);
  }

  /** Бейджи количества на кнопках «+» и плавающая кнопка корзины */
  function updateBadges() {
    $$('.add-btn', els.sections).forEach((btn) => {
      const q = Cart.qtyOf(btn.dataset.add);
      btn.classList.toggle('is-in', q > 0);
      if (q > 0) btn.textContent = q;
      else if (!btn.querySelector('svg')) {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
      }
    });

    const count = Cart.count();
    els.fabCart.classList.toggle('is-hidden', count === 0);
    $('.fab-cart__sum', els.fabCart).textContent = money(Cart.total());
    $('.fab-cart__count', els.fabCart).textContent = count;
  }

  /* ---------------------------------------------------------
     СОБЫТИЯ
     --------------------------------------------------------- */
  function toggleLangList(force) {
    const open = force ?? els.langList.hidden;
    els.langList.hidden = !open;
    els.langBtn.setAttribute('aria-expanded', String(open));
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    const act = t.closest('[data-action]')?.dataset.action;

    if (act === 'toggle-lang') { toggleLangList(); return; }
    if (!t.closest('.lang')) toggleLangList(false);

    const lang = t.closest('[data-lang]');
    if (lang) { I18n.set(lang.dataset.lang); toggleLangList(false); return; }

    if (act === 'go-welcome') { App.back('#/'); return; }
    if (act === 'to-top') { e.preventDefault(); spyLockUntil = 0; window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (act === 'open-cart') { App.go('#/cart'); return; }
    if (act === 'clear-search') { els.search.value = ''; applySearch(); els.search.focus(); return; }

    const promo = t.closest('[data-promo]');
    if (promo) { openPromo(+promo.dataset.promo); return; }

    const cat = t.closest('[data-cat].cat');
    if (cat) { goToCategory(cat.dataset.cat); return; }

    const pill = t.closest('.pill');
    if (pill) { goToSection(pill.dataset.sec); return; }

    const add = t.closest('[data-add]');
    if (add) { handleAdd(add.dataset.add, add); }
  });

  // Модалки живут вне #menu
  [els.promoModal, els.variantSheet].forEach((ov) => {
    ov.addEventListener('click', (e) => {
      const t = e.target;
      if (t === ov || t.closest('[data-action="close-overlay"]')) { overlay.close(ov); return; }

      const goto = t.closest('[data-goto-item]');
      if (goto) {
        overlay.close(ov);
        App.go('#/menu');
        setTimeout(() => goToItem(goto.dataset.gotoItem), 260);
        return;
      }

      const pick = t.closest('[data-pick]');
      if (pick) {
        Cart.add(pick.dataset.pick, +pick.dataset.v);
        overlay.close(ov);
        toast(I18n.t('added'));
        bump($(`.add-btn[data-add="${CSS.escape(pick.dataset.pick)}"]`, els.sections));
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { overlay.closeAll(); toggleLangList(false); }
  });

  els.search.addEventListener('input', debounce(applySearch, 120));
  els.search.addEventListener('keydown', (e) => { if (e.key === 'Enter') els.search.blur(); });

  Cart.subscribe(() => {
    updateBadges();
    bump(els.fabCart);
  });

  App.Menu = { render, handleAdd, goToCategory, goToItem, onScroll };
})(window.App);
