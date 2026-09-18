/* =========================================================
   CART VIEW — экран «Ваш заказ», рекомендации, отправка заказа
   ========================================================= */
(function (App) {
  const C = window.APP_CONFIG;
  const { $, esc, money, img, toast, lockScroll } = App.utils;
  const I18n = App.I18n;
  const Cart = App.Cart;

  const root = $('#cart');
  const body = $('.cart__body', root);
  const orderBtn = $('.order-btn', root);

  const MINUS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>';
  const PLUS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const CROSS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /** Рекомендации: объединяем recommendations всех позиций, исключаем то, что уже в корзине */
  function getRecommendations(lines) {
    const inCart = new Set(lines.map((l) => l.item.id));
    const ids = [];
    lines.forEach((l) => l.item.recommendations.forEach((id) => {
      if (!inCart.has(id) && !ids.includes(id) && Cart.getItem(id)) ids.push(id);
    }));
    return ids.slice(0, 12).map(Cart.getItem);
  }

  const minPrice = (it) => (it.variants.length ? Math.min(...it.variants.map((v) => v.price)) : it.price);

  function lineHTML(l) {
    const title = I18n.f(l.item, 'title');
    const variant = l.variant ? (l.variant.label || I18n.t('byDefault')) : I18n.t('byDefault');
    return `
      <div class="citem">
        ${img(l.item.image, 'citem__img', title)}
        <div class="citem__body">
          <div class="citem__top">
            <h3 class="citem__title">${esc(title)}</h3>
            <button type="button" class="citem__remove" data-remove="${esc(l.key)}" aria-label="${esc(I18n.t('remove'))}">${CROSS}</button>
          </div>
          <p class="citem__variant">• ${esc(variant)}</p>
          <div class="citem__row">
            <div class="qty">
              <button type="button" data-dec="${esc(l.key)}" aria-label="−">${MINUS}</button>
              <span>${l.qty}</span>
              <button type="button" data-inc="${esc(l.key)}" aria-label="+">${PLUS}</button>
            </div>
            <span class="citem__sum">${money(l.sum)}</span>
          </div>
        </div>
      </div>`;
  }

  function recHTML(it) {
    const title = I18n.f(it, 'title');
    const prefix = it.variants.length > 1 ? I18n.t('from') + ' ' : '';
    return `
      <button type="button" class="rec" data-rec="${esc(it.id)}">
        ${img(it.image, 'rec__img', title)}
        <span class="rec__title">${esc(title)}</span>
        <span class="rec__price">${esc(prefix)}${money(minPrice(it))}</span>
      </button>`;
  }

  function render() {
    I18n.applyStatic();
    const lines = Cart.lines();
    orderBtn.disabled = lines.length === 0;
    $('.cart__foot', root).hidden = lines.length === 0;

    if (!lines.length) {
      body.innerHTML = `
        <div class="cart__empty">
          <p>${esc(I18n.t('emptyCart'))}</p>
          <button type="button" data-action="close-cart">${esc(I18n.t('toMenu'))}</button>
        </div>`;
      return;
    }

    const recs = getRecommendations(lines);
    body.innerHTML = `
      ${lines.map(lineHTML).join('')}
      <div class="totals">
        <div class="totals__row totals__row--muted"><span>${esc(I18n.t('positions'))}</span><span>${Cart.count()}</span></div>
        <div class="totals__row"><span>${esc(I18n.t('total'))}</span><strong>${money(Cart.total())}</strong></div>
      </div>
      ${recs.length ? `
        <h3 class="recs__title">${esc(I18n.t('addToOrder'))}</h3>
        <div class="hscroll recs">${recs.map(recHTML).join('')}</div>` : ''}`;
  }

  /* ---------- открытие / закрытие (вызывается роутером) ---------- */
  function open() {
    render();
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    lockScroll('cart', true);
  }
  function close() {
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    lockScroll('cart', false);
  }

  /* ---------- заказ ---------- */
  function buildOrderText(lines) {
    const rows = lines.map((l, i) => {
      const v = l.variant && l.variant.label ? ` (${l.variant.label})` : '';
      return `${i + 1}. ${I18n.f(l.item, 'title')}${v} × ${l.qty} — ${money(l.sum)}`;
    });
    return `${I18n.t('orderMsgTitle')}:\n${rows.join('\n')}\n\n${I18n.t('total')}: ${money(Cart.total())}`;
  }

  async function order() {
    const lines = Cart.lines();
    if (!lines.length) return;
    const text = buildOrderText(lines);
    const phone = String(App.data?.settings?.whatsapp || C.WHATSAPP || '').replace(/\D/g, '');

    // WhatsApp открываем синхронно в обработчике клика — иначе браузер заблокирует окно
    if (phone) {
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      const w = window.open(url, '_blank');
      if (!w) location.href = url;
    }

    if (C.ORDER_ENDPOINT) {
      orderBtn.disabled = true;
      try {
        await fetch(C.ORDER_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',                        // «простой» запрос без preflight — Apps Script его примет
          body: JSON.stringify({
            lang: I18n.lang,
            total: Cart.total(),
            text,
            items: lines.map((l) => ({ id: l.item.id, title: I18n.f(l.item, 'title'), variant: l.variant?.label || '', qty: l.qty, price: l.price }))
          })
        });
        Cart.clear();
        toast(I18n.t('orderSent'));
        App.go('#/menu');
      } catch (e) {
        toast(I18n.t('orderFailed'));
      } finally {
        orderBtn.disabled = false;
      }
    }
  }

  /* ---------- события ---------- */
  root.addEventListener('click', (e) => {
    const t = e.target;
    const act = t.closest('[data-action]')?.dataset.action;
    if (act === 'close-cart') { App.back('#/menu'); return; }
    if (act === 'order') { order(); return; }

    const inc = t.closest('[data-inc]'); if (inc) { Cart.inc(inc.dataset.inc); return; }
    const dec = t.closest('[data-dec]'); if (dec) { Cart.dec(dec.dataset.dec); return; }
    const rm = t.closest('[data-remove]'); if (rm) { Cart.remove(rm.dataset.remove); return; }
    const rec = t.closest('[data-rec]'); if (rec) { App.Menu.handleAdd(rec.dataset.rec); }
  });

  Cart.subscribe(() => { if (root.classList.contains('is-open')) render(); });

  App.CartView = { open, close, render };
})(window.App);
