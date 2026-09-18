# Веб-меню ресторана (SPA, GitHub Pages + Google Таблица)

## Структура

```
index.html            — разметка трёх экранов + модалки
css/styles.css        — все стили (токены в :root)
js/config.js          — НАСТРОЙКИ: API_URL, WhatsApp, валюта, порядок в вариациях
js/mock-data.js       — тестовые данные (работают, пока API_URL пустой)
js/utils.js           — хелперы: экранирование, localStorage, toast, оверлеи
js/i18n.js            — строки интерфейса RU / KZ / EN
js/api.js             — загрузка + нормализация JSON, кэш в localStorage
js/cart.js            — состояние корзины (localStorage)
js/welcome.js         — главный экран
js/menu.js            — меню: акции, поиск, категории, разделы, scroll-spy
js/cart-view.js       — экран заказа, рекомендации, отправка
js/app.js             — роутер (#/, #/menu, #/cart) и запуск
apps-script/Code.gs   — бэкенд для Google Таблицы
assets/               — логотипы (заменить на свои)
```

Запуск локально: просто открыть `index.html` двойным кликом — ES-модули не используются, поэтому работает и с `file://`.

## Google Таблица → JSON

1. Создай Google Таблицу → **Расширения → Apps Script**.
2. Удали содержимое `Код.gs`, вставь `apps-script/Code.gs`, сохрани.
3. Выбери функцию `setupSheets` → **Выполнить** → разреши доступ. Появятся листы с колонками и примерами.
4. **Развернуть → Новое развертывание** → тип «Веб-приложение»:
   - Запуск от имени: **Я**
   - У кого есть доступ: **Все**
5. Скопируй URL вида `https://script.google.com/macros/s/.../exec`.
6. В `js/config.js`: `API_URL: '<URL>'`, и если нужны заказы в таблицу — `ORDER_ENDPOINT: '<тот же URL>'`.
7. Проверка: открой URL в браузере — должен отдаться JSON.

**Важно:** после правки кода скрипта — **Развернуть → Управление развертываниями → ✏️ → Версия: новая**. Иначе будет работать старый код. URL при этом не меняется.

### Колонки листов

| Лист | Колонки |
|---|---|
| Settings | `key`, `value` — ключи: name, tagline_ru/kk/en, logoWelcome, logoHeader, bgImage, bgVideo, whatsapp |
| Buttons | id, sort, active, type (`menu` / `link` / `tel`), style (`primary` / `outline` / `wide` / `text`), title_ru, title_kk, title_en, url |
| Promos | id, sort, active, image, title_*, description_*, itemId (необязательно — кнопка «Посмотреть блюдо») |
| Categories | id, sort, active, image, title_* |
| Sections | id, sort, active, categoryId, title_*, subtitle_* |
| Menu | id, sort, active, sectionId, image, title_*, description_*, price, variants, recommendations |

- **variants**: `30 мл:850 | 60 мл:950` (или каждая вариация с новой строки в ячейке). Если заполнено — `price` можно не указывать.
- **recommendations**: id блюд через запятую: `cheesecake, tiramisu`.
- **active**: чекбокс. Снял галочку — позиция пропала с сайта (стоп-лист).
- **sort**: число, порядок вывода.
- Пустые `_kk` / `_en` → показывается русский текст.
- Для `type=menu` в `url` можно указать id категории — меню откроется сразу на ней.
- Для `type=tel` в `url` — номер в любом формате.

### Картинки

- Лучше всего: положить в репозиторий (`assets/menu/espresso.webp`) и писать относительный путь. Быстро и надёжно.
- Google Drive: файл → «Доступ: все, у кого есть ссылка» → вставить ссылку как есть. Скрипт сам превратит её в прямую (`drive.google.com/thumbnail?id=...`).
- Размер: ~600×600 для блюд, ~900×500 для акций, WebP/JPG до 150 КБ.

### Кэш

- Apps Script кэширует JSON на 5 минут, любое редактирование таблицы сбрасывает кэш (триггер `onEdit`).
- Ручной сброс: меню таблицы **🍽 Меню сайта → Обновить сайт**.
- На клиенте меню показывается мгновенно из localStorage, свежие данные подтягиваются в фоне.

## Заказы

- Кнопка «Заказать» открывает WhatsApp с готовым текстом заказа на номер из `Settings → whatsapp`.
- Если задан `ORDER_ENDPOINT`, заказ дополнительно пишется в лист `Orders`, корзина очищается.
- Endpoint публичный — при спаме добавь проверку секретного поля в `doPost`.

## GitHub Pages

1. Залей папку в репозиторий (index.html в корне).
2. **Settings → Pages → Source: Deploy from a branch → main / root**.
3. Через 1–2 минуты сайт на `https://<user>.github.io/<repo>/`.
4. Свой домен: Settings → Pages → Custom domain + CNAME-запись у регистратора.

QR-код на столы — на ссылку `https://.../#/menu`, чтобы гость попадал сразу в меню.
