/* =========================================================
   UTILS — общие хелперы. Всё складываем в window.App
   ========================================================= */
window.App = window.App || {};

(function (App) {
  const C = window.APP_CONFIG;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Экранирование — все данные из таблицы вставляем только через esc() */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  /** Защита от javascript:/data: ссылок из таблицы */
  const safeUrl = (url) => {
    const u = String(url ?? '').trim();
    if (/^(javascript|vbscript):/i.test(u)) return '';
    if (/^data:/i.test(u) && !/^data:image\//i.test(u)) return '';
    return u;
  };

  const money = (n) =>
    Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/\s/g, '\u00a0') + '\u00a0' + C.CURRENCY;

  const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();

  const debounce = (fn, ms = 150) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  /** localStorage с защитой от ошибок (приватный режим, переполнение) */
  const store = {
    get(key, fallback = null) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
    },
    remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } }
  };

  /** Заглушка, если картинка не загрузилась */
  const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f2f2f5"/>' +
    '<circle cx="50" cy="52" r="20" fill="none" stroke="#c7c7cc" stroke-width="3"/>' +
    '<circle cx="50" cy="52" r="11" fill="none" stroke="#d8d8dd" stroke-width="2"/>' +
    '<path d="M24 30v14M28 30v14M26 44v26M76 30c-4 4-4 14 0 18v22" stroke="#c7c7cc" stroke-width="3" fill="none" stroke-linecap="round"/></svg>'
  );

  /** <img> с lazy-load и фолбэком */
  const img = (src, cls, alt = '', eager = false) =>
    `<img class="${cls}" src="${esc(safeUrl(src) || PLACEHOLDER)}" alt="${esc(alt)}" data-fb ` +
    `${eager ? '' : 'loading="lazy"'} decoding="async">`;

  document.addEventListener('error', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.hasAttribute('data-fb') && !t.dataset.failed) {
      t.dataset.failed = '1';
      t.src = PLACEHOLDER;
    }
  }, true);

  /** Toast-уведомление */
  let toastTimer;
  const toast = (text) => {
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-shown'), 1800);
  };

  /** Перезапуск CSS-анимации */
  const bump = (el, cls = 'bump') => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };

  /** Блокировка скролла body (для модалок и корзины) */
  const locks = new Set();
  const lockScroll = (id, on) => {
    on ? locks.add(id) : locks.delete(id);
    document.body.classList.toggle('is-locked', locks.size > 0);
  };

  /** Универсальные оверлеи (модалка акции, выбор варианта) */
  const overlay = {
    open(el) {
      el.hidden = false;
      requestAnimationFrame(() => el.classList.add('is-open'));
      lockScroll(el.id, true);
    },
    close(el) {
      if (!el || el.hidden) return;
      el.classList.remove('is-open');
      lockScroll(el.id, false);
      setTimeout(() => { el.hidden = true; }, 250);
    },
    closeAll() { $$('.overlay:not([hidden])').forEach(overlay.close); }
  };

  App.utils = { $, $$, esc, safeUrl, money, norm, debounce, store, img, toast, bump, lockScroll, overlay, PLACEHOLDER };
})(window.App);
