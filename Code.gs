/**
 * =========================================================
 *  Google Apps Script — JSON API для меню ресторана
 * =========================================================
 *  1. Таблица → Расширения → Apps Script → вставить этот файл.
 *  2. Выполнить setupSheets() один раз — создаст листы с нужными колонками и примерами.
 *  3. Развернуть → Новое развертывание → Веб-приложение
 *       Запуск от имени: Я | Доступ: Все (Anyone)
 *  4. URL (…/exec) вставить в js/config.js → API_URL (и ORDER_ENDPOINT для заказов).
 *
 *  GET  /exec            → JSON меню (кэш 5 мин)
 *  GET  /exec?nocache=1  → JSON без кэша
 *  POST /exec            → запись заказа в лист «Orders»
 */

const SHEET = {
  settings: 'Settings',
  buttons: 'Buttons',
  promos: 'Promos',
  categories: 'Categories',
  sections: 'Sections',
  menu: 'Menu',
  orders: 'Orders'
};

const CACHE_KEY = 'menu_json_v1';
const CACHE_TTL = 300; // секунд
const IMAGE_FIELDS = ['image', 'logo', 'logoWelcome', 'logoHeader', 'bgImage', 'bgVideo'];

/* ---------------------------------------------------------
   GET — отдаём меню
   --------------------------------------------------------- */
function doGet(e) {
  try {
    const noCache = e && e.parameter && e.parameter.nocache;
    const cache = CacheService.getScriptCache();

    if (!noCache) {
      const cached = cache.get(CACHE_KEY);
      if (cached) return json_(cached);
    }

    const str = JSON.stringify(buildData_());
    if (str.length < 100000) cache.put(CACHE_KEY, str, CACHE_TTL); // лимит CacheService — 100 КБ
    return json_(str);
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function buildData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    settings: readSettings_(ss),
    buttons: readTable_(ss, SHEET.buttons),
    promos: readTable_(ss, SHEET.promos),
    categories: readTable_(ss, SHEET.categories),
    sections: readTable_(ss, SHEET.sections),
    menuItems: readTable_(ss, SHEET.menu).map(function (r) {
      return Object.assign({}, r, {
        price: toNum_(r.price),
        variants: parseVariants_(r.variants),
        recommendations: splitList_(r.recommendations)
      });
    })
  };
}

/* ---------------------------------------------------------
   POST — приём заказа
   --------------------------------------------------------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET.orders);
    if (!sh) {
      sh = ss.insertSheet(SHEET.orders);
      sh.appendRow(['Дата', 'Заказ', 'Сумма', 'Язык', 'Статус']);
      sh.setFrozenRows(1);
    }
    sh.appendRow([
      new Date(),
      noFormula_(String(body.text || '').slice(0, 5000)),
      Number(body.total) || 0,
      noFormula_(String(body.lang || '')),
      'Новый'
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------
   Чтение листов
   --------------------------------------------------------- */
function readTable_(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh) return [];
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(function (h) { return String(h).trim(); });
  const out = [];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (row.every(function (c) { return c === '' || c === null; })) continue;

    const o = {};
    headers.forEach(function (h, i) {
      if (!h) return;
      let v = row[i];
      if (v instanceof Date) v = v.toISOString();
      if (typeof v === 'string') v = v.trim();
      if (IMAGE_FIELDS.indexOf(h) !== -1) v = driveUrl_(v);
      o[h] = v;
    });

    // Колонка active: FALSE / 0 / нет → строка скрыта
    if (o.active === false || /^(false|0|нет|no)$/i.test(String(o.active))) continue;
    delete o.active;
    if (o.id !== undefined) o.id = String(o.id);
    out.push(o);
  }

  // Сортировка по колонке sort (пустые — в порядке строк)
  out.sort(function (a, b) { return (Number(a.sort) || 0) - (Number(b.sort) || 0); });
  out.forEach(function (o) { delete o.sort; });
  return out;
}

/** Лист Settings: две колонки key | value */
function readSettings_(ss) {
  const sh = ss.getSheetByName(SHEET.settings);
  const res = {};
  if (!sh) return res;
  sh.getDataRange().getValues().slice(1).forEach(function (row) {
    const key = String(row[0] || '').trim();
    if (!key) return;
    let v = typeof row[1] === 'string' ? row[1].trim() : row[1];
    if (IMAGE_FIELDS.indexOf(key) !== -1) v = driveUrl_(v);
    res[key] = v;
  });
  return res;
}

/* ---------------------------------------------------------
   Хелперы
   --------------------------------------------------------- */
/** "30 мл:850 | 60 мл:950" → [{label:"30 мл", price:850}, ...] */
function parseVariants_(v) {
  if (!v) return [];
  return String(v).split(/\||\n/).map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) {
    const i = s.lastIndexOf(':');
    return i < 0 ? { label: '', price: toNum_(s) } : { label: s.slice(0, i).trim(), price: toNum_(s.slice(i + 1)) };
  });
}

function splitList_(v) {
  if (v === '' || v == null) return [];
  return String(v).split(/[,;\n]/).map(function (s) { return s.trim(); }).filter(Boolean);
}

function toNum_(v) {
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v || '').replace(/[\s\u00a0]/g, '').replace(',', '.'));
  return isFinite(n) ? n : 0;
}

/** Ссылка «Поделиться» из Google Drive → прямая ссылка на картинку */
function driveUrl_(v) {
  if (!v) return '';
  const s = String(v);
  const m = s.match(/drive\.google\.com\/.*?(?:\/d\/|[?&]id=)([\w-]{20,})/);
  return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1200' : s;
}

/** Защита от формул в ячейках при записи заказов */
function noFormula_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return ContentService.createTextOutput(str).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------------------------------------------------
   Кэш и меню в таблице
   --------------------------------------------------------- */
function clearCache() {
  CacheService.getScriptCache().remove(CACHE_KEY);
}

/** Простой триггер: любое редактирование таблицы сбрасывает кэш */
function onEdit() {
  clearCache();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🍽 Меню сайта')
    .addItem('Обновить сайт (сбросить кэш)', 'clearCache')
    .addItem('Создать листы-шаблоны', 'setupSheets')
    .addToUi();
}

/* ---------------------------------------------------------
   Первичная настройка: создаёт листы с колонками и примерами.
   Существующие листы с данными НЕ трогает.
   --------------------------------------------------------- */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const templates = {
    Settings: [
      ['key', 'value'],
      ['name', 'DALA'],
      ['tagline_ru', 'Кофейня и кухня'],
      ['tagline_kk', 'Кофехана және ас үй'],
      ['tagline_en', 'Coffee & kitchen'],
      ['logoWelcome', 'assets/logo-welcome.svg'],
      ['logoHeader', 'assets/logo-header.svg'],
      ['bgImage', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=70'],
      ['bgVideo', ''],
      ['whatsapp', '77001234567']
    ],
    Buttons: [
      ['id', 'sort', 'active', 'type', 'style', 'title_ru', 'title_kk', 'title_en', 'url'],
      ['b1', 1, true, 'menu', 'primary', 'Меню', 'Мәзір', 'Menu', ''],
      ['b2', 2, true, 'link', 'outline', 'Забронировать', 'Брондау', 'Book a table', 'https://wa.me/77001234567'],
      ['b3', 3, true, 'tel', 'outline', 'Позвонить', 'Қоңырау шалу', 'Call us', '+7 700 123 45 67'],
      ['b4', 4, true, 'link', 'outline', 'Мы на 2GIS', '2GIS-те', 'Find us on 2GIS', 'https://2gis.kz/uralsk'],
      ['b5', 5, true, 'menu', 'text', 'Детское меню', 'Балалар мәзірі', 'Kids menu', 'kids']
    ],
    Promos: [
      ['id', 'sort', 'active', 'image', 'title_ru', 'title_kk', 'title_en', 'description_ru', 'description_kk', 'description_en', 'itemId'],
      ['p1', 1, true, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=70', 'Второй капучино −50%', '', 'Second cappuccino −50%', 'Каждый будний день с 8:00 до 11:00.', '', 'Weekdays 8:00–11:00.', 'cappuccino']
    ],
    Categories: [
      ['id', 'sort', 'active', 'image', 'title_ru', 'title_kk', 'title_en'],
      ['bar', 1, true, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=70', 'Барное меню', 'Бар мәзірі', 'Bar menu'],
      ['main', 2, true, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70', 'Основное меню', 'Негізгі мәзір', 'Main menu'],
      ['kids', 3, true, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=70', 'Детское меню', 'Балалар мәзірі', 'Kids menu']
    ],
    Sections: [
      ['id', 'sort', 'active', 'categoryId', 'title_ru', 'title_kk', 'title_en', 'subtitle_ru', 'subtitle_kk', 'subtitle_en'],
      ['classic-coffee', 1, true, 'bar', 'Классический кофе', 'Классикалық кофе', 'Classic coffee', 'Только двойной эспрессо и 100% арабика', '', ''],
      ['hot', 2, true, 'main', 'Горячие блюда', 'Ыстық тағамдар', 'Hot dishes', '', '', ''],
      ['kids-menu', 3, true, 'kids', 'Для детей', 'Балаларға', 'For kids', '', '', '']
    ],
    Menu: [
      ['id', 'sort', 'active', 'sectionId', 'image', 'title_ru', 'title_kk', 'title_en', 'description_ru', 'description_kk', 'description_en', 'price', 'variants', 'recommendations'],
      ['espresso', 1, true, 'classic-coffee', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=70', 'Эспрессо', '', 'Espresso', 'Крепкий кофе с балансом кислинки и сладости', '', '', '', '30 мл:850 | 60 мл:950', 'cheesecake'],
      ['cappuccino', 2, true, 'classic-coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=70', 'Капучино', '', 'Cappuccino', 'Эспрессо, молоко и молочная пена', '', '', '', '250 мл:1200 | 350 мл:1400', 'cheesecake, pancakes'],
      ['bolognese', 3, true, 'hot', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=70', 'Болоньезе', '', 'Bolognese', 'Паста с рагу из говядины', '', '', 2900, '', 'cappuccino'],
      ['pancakes', 4, true, 'kids-menu', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=70', 'Панкейки', 'Панкейктер', 'Pancakes', 'С ягодами и кленовым сиропом', '', '', 1500, '', 'cappuccino'],
      ['cheesecake', 5, true, 'kids-menu', '', 'Чизкейк', '', 'Cheesecake', 'Классический сливочный', '', '', 1900, '', 'espresso']
    ]
  };

  Object.keys(templates).forEach(function (name) {
    let sh = ss.getSheetByName(name);
    if (sh && sh.getLastRow() > 0) return; // уже заполнен — не трогаем
    if (!sh) sh = ss.insertSheet(name);

    const rows = templates[name];
    sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, rows[0].length).setFontWeight('bold').setBackground('#f2f2f5');

    const activeCol = rows[0].indexOf('active');
    if (activeCol !== -1) sh.getRange(2, activeCol + 1, 200, 1).insertCheckboxes();
    sh.autoResizeColumns(1, rows[0].length);
  });

  clearCache();
}
