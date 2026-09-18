/* =========================================================
   CART — состояние корзины (localStorage)
   Строка корзины: key = "<itemId>::<variantIndex>", variantIndex = -1 если вариаций нет
   ========================================================= */
(function (App) {
  const C = window.APP_CONFIG;
  const { store } = App.utils;

  let state = store.get(C.CART_KEY, {}) || {};
  let index = new Map();          // id → блюдо
  const subs = [];

  const keyOf = (id, v) => `${id}::${v}`;

  function commit() {
    store.set(C.CART_KEY, state);
    subs.forEach((fn) => fn());
  }

  const Cart = {
    /** Привязать к актуальному меню и выкинуть удалённые/изменённые позиции */
    setMenu(items) {
      index = new Map(items.map((i) => [i.id, i]));
      Object.keys(state).forEach((k) => {
        const line = state[k];
        const item = index.get(line.id);
        const badVariant = item && line.v >= 0 && !item.variants[line.v];
        if (!item || badVariant || !(line.qty > 0)) delete state[k];
      });
      commit();
    },

    getItem: (id) => index.get(id),

    add(id, v = -1, qty = 1) {
      if (!index.has(id)) return;
      const k = keyOf(id, v);
      state[k] = state[k] ? { ...state[k], qty: state[k].qty + qty } : { id, v, qty };
      commit();
    },

    inc(k) { if (state[k]) { state[k].qty += 1; commit(); } },

    dec(k) {
      if (!state[k]) return;
      state[k].qty -= 1;
      if (state[k].qty <= 0) delete state[k];
      commit();
    },

    remove(k) { delete state[k]; commit(); },

    clear() { state = {}; commit(); },

    /** Строки корзины с данными блюда и ценой */
    lines() {
      return Object.entries(state).map(([key, l]) => {
        const item = index.get(l.id);
        if (!item) return null;
        const variant = l.v >= 0 ? item.variants[l.v] : null;
        const price = variant ? variant.price : item.price;
        return { key, item, variant, qty: l.qty, price, sum: price * l.qty };
      }).filter(Boolean);
    },

    total() { return Cart.lines().reduce((s, l) => s + l.sum, 0); },
    count() { return Cart.lines().reduce((s, l) => s + l.qty, 0); },

    /** Сколько штук блюда (все вариации) в корзине */
    qtyOf(id) {
      return Object.values(state).reduce((s, l) => (l.id === id ? s + l.qty : s), 0);
    },

    subscribe(fn) { subs.push(fn); }
  };

  App.Cart = Cart;
})(window.App);
