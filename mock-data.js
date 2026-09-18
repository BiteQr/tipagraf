/* =========================================================
   MOCK DATA — та же структура, что отдаёт Google Apps Script.
   Мультиязычные поля: title_ru / title_kk / title_en (пустое → берётся _ru).
   ========================================================= */
(function () {
  const img = (id, w = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

  window.MOCK_DATA = {
    settings: {
      name: 'DALA',
      tagline_ru: 'Кофейня и кухня',
      tagline_kk: 'Кофехана және ас үй',
      tagline_en: 'Coffee & kitchen',
      logoWelcome: 'logo-welcome.svg',   // светлый логотип для тёмного экрана
      logoHeader: 'logo-header.svg',     // тёмный логотип для шапки меню
      bgImage: img('photo-1517248135467-4c7edcad34c4', 1400),
      bgVideo: '',                              // например: 'assets/bg.mp4'
      whatsapp: '77001234567'
    },

    /* type: menu | link | tel ; style: primary | outline | wide | text
       Для type=menu в url можно указать id категории — меню откроется сразу на ней */
    buttons: [
      { id: 'b1', type: 'menu', style: 'primary', url: '', title_ru: 'Меню', title_kk: 'Мәзір', title_en: 'Menu' },
      { id: 'b2', type: 'link', style: 'outline', url: 'https://wa.me/77001234567?text=Здравствуйте! Хочу забронировать стол', title_ru: 'Забронировать', title_kk: 'Брондау', title_en: 'Book a table' },
      { id: 'b3', type: 'tel', style: 'outline', url: '+7 700 123 45 67', title_ru: 'Позвонить', title_kk: 'Қоңырау шалу', title_en: 'Call us' },
      { id: 'b4', type: 'link', style: 'outline', url: 'https://2gis.kz/uralsk', title_ru: 'Мы на 2GIS', title_kk: '2GIS-те', title_en: 'Find us on 2GIS' },
      { id: 'b5', type: 'link', style: 'outline', url: 'https://instagram.com/', title_ru: 'Instagram', title_kk: 'Instagram', title_en: 'Instagram' },
      { id: 'b6', type: 'menu', style: 'text', url: 'kids', title_ru: 'Детское меню', title_kk: 'Балалар мәзірі', title_en: 'Kids menu' }
    ],

    promos: [
      {
        id: 'p1', image: img('photo-1495474472287-4d71bcdd2085', 900),
        title_ru: 'Второй капучино −50%', title_en: 'Second cappuccino −50%', title_kk: 'Екінші капучино −50%',
        description_ru: 'Каждый будний день с 8:00 до 11:00.\nСкидка на второй напиток в чеке.',
        description_en: 'Every weekday 8:00–11:00. 50% off the second drink.',
        itemId: 'cappuccino'
      },
      {
        id: 'p2', image: img('photo-1567620905732-2d1ec7ab7445', 900),
        title_ru: 'Панкейки для маленьких гостей', title_en: 'Pancakes for kids',
        description_ru: 'Детям до 7 лет — какао в подарок к любому блюду из детского меню.',
        description_en: 'Free cocoa for kids under 7 with any kids menu dish.',
        itemId: 'pancakes'
      },
      {
        id: 'p3', image: img('photo-1600891964092-4316c288032e', 900),
        title_ru: 'Стейк-вечер по пятницам', title_en: 'Friday steak night',
        description_ru: 'Рибай + бокал лимонада по специальной цене.',
        description_en: 'Ribeye + lemonade at a special price.',
        itemId: 'steak'
      }
    ],

    categories: [
      { id: 'bar', image: img('photo-1509042239860-f550ce710b93', 400), title_ru: 'Барное меню', title_kk: 'Бар мәзірі', title_en: 'Bar menu' },
      { id: 'main', image: img('photo-1504674900247-0877df9cc836', 400), title_ru: 'Основное меню', title_kk: 'Негізгі мәзір', title_en: 'Main menu' },
      { id: 'kids', image: img('photo-1567620905732-2d1ec7ab7445', 400), title_ru: 'Детское меню', title_kk: 'Балалар мәзірі', title_en: 'Kids menu' },
      { id: 'desserts', image: img('photo-1578985545062-69928b1d9587', 400), title_ru: 'Десерты', title_kk: 'Десерттер', title_en: 'Desserts' }
    ],

    sections: [
      { id: 'classic-coffee', categoryId: 'bar', title_ru: 'Классический кофе', title_kk: 'Классикалық кофе', title_en: 'Classic coffee',
        subtitle_ru: 'Готовим только на двойном эспрессо из 100% арабики Бразилии и Колумбии — 18–20 г кофе на порцию.',
        subtitle_en: 'Double espresso only, 100% arabica from Brazil and Colombia — 18–20 g per shot.' },
      { id: 'signature-coffee', categoryId: 'bar', title_ru: 'Авторский кофе', title_kk: 'Авторлық кофе', title_en: 'Signature coffee' },
      { id: 'tea', categoryId: 'bar', title_ru: 'Авторский чай', title_kk: 'Авторлық шай', title_en: 'Signature tea' },
      { id: 'lemonades', categoryId: 'bar', title_ru: 'Лимонады', title_kk: 'Лимонадтар', title_en: 'Lemonades' },
      { id: 'salads', categoryId: 'main', title_ru: 'Салаты', title_kk: 'Салаттар', title_en: 'Salads' },
      { id: 'hot', categoryId: 'main', title_ru: 'Горячие блюда', title_kk: 'Ыстық тағамдар', title_en: 'Hot dishes',
        subtitle_ru: 'Мясо и птица с открытого огня', subtitle_en: 'Meat and poultry from the open fire' },
      { id: 'pizza', categoryId: 'main', title_ru: 'Пицца', title_kk: 'Пицца', title_en: 'Pizza',
        subtitle_ru: 'Тесто выдерживаем 48 часов', subtitle_en: '48-hour fermented dough' },
      { id: 'kids-menu', categoryId: 'kids', title_ru: 'Для детей', title_kk: 'Балаларға', title_en: 'For kids',
        subtitle_ru: 'Небольшие порции без острого', subtitle_en: 'Small portions, nothing spicy' },
      { id: 'cakes', categoryId: 'desserts', title_ru: 'Торты и десерты', title_kk: 'Торттар мен десерттер', title_en: 'Cakes & desserts' }
    ],

    menuItems: [
      /* ---- Классический кофе ---- */
      { id: 'espresso', sectionId: 'classic-coffee', image: img('photo-1510591509098-f4fdc6d0ff04'),
        title_ru: 'Эспрессо', title_en: 'Espresso',
        description_ru: 'Крепкий кофе с балансом кислинки, горчинки и сладости.',
        description_en: 'Strong coffee with balanced acidity, bitterness and sweetness.',
        variants: [{ label: '30 мл', price: 850 }, { label: '60 мл', price: 950 }],
        recommendations: ['cheesecake', 'tiramisu'] },
      { id: 'americano', sectionId: 'classic-coffee', image: img('photo-1497935586351-b67a49e012bf'),
        title_ru: 'Американо', title_en: 'Americano',
        description_ru: 'Двойной эспрессо, разбавленный горячей водой.',
        description_en: 'Double espresso topped with hot water.',
        variants: [{ label: '250 мл', price: 950 }, { label: '350 мл', price: 1100 }],
        recommendations: ['cheesecake', 'club-sandwich'] },
      { id: 'flat-white', sectionId: 'classic-coffee', image: img('photo-1541167760496-1628856ab772'),
        title_ru: 'Флэт уайт', title_en: 'Flat white',
        description_ru: 'Двойной эспрессо и молоко, взбитое в плотную бархатную пену.',
        price: 1300, recommendations: ['choco-cake'] },
      { id: 'cappuccino', sectionId: 'classic-coffee', image: img('photo-1572442388796-11668a67e53d'),
        title_ru: 'Капучино', title_en: 'Cappuccino',
        description_ru: 'Эспрессо, молоко и воздушная молочная пена.',
        variants: [{ label: '250 мл', price: 1200 }, { label: '350 мл', price: 1400 }],
        recommendations: ['cheesecake', 'choco-cake', 'pancakes'] },

      /* ---- Авторский кофе ---- */
      { id: 'lavender-latte', sectionId: 'signature-coffee', image: img('photo-1461023058943-07fcbe16d735'),
        title_ru: 'Лавандовый латте', title_en: 'Lavender latte',
        description_ru: 'Латте с домашним лавандовым сиропом.',
        variants: [{ label: '350 мл', price: 1600 }, { label: '450 мл', price: 1800 }],
        recommendations: ['cheesecake'] },
      { id: 'halva-raf', sectionId: 'signature-coffee', image: img('photo-1485808191679-5f86510681a2'),
        title_ru: 'Раф халва', title_en: 'Halva raf',
        description_ru: 'Сливочный раф с подсолнечной халвой.',
        price: 1700, recommendations: ['tiramisu'] },

      /* ---- Чай (пример без фото — как «Ташкентский» на скриншоте) ---- */
      { id: 'tea-tashkent', sectionId: 'tea', image: '',
        title_ru: 'Ташкентский', title_kk: 'Ташкент шайы', title_en: 'Tashkent tea',
        description_ru: 'Смесь чёрного и зелёного чая, апельсин, имбирь, мята, мёд и корица.',
        description_en: 'Black and green tea, orange, ginger, mint, honey and cinnamon.',
        variants: [{ label: '500 мл', price: 1500 }, { label: '900 мл', price: 1700 }],
        recommendations: ['choco-cake', 'cheesecake'] },
      { id: 'tea-seabuckthorn', sectionId: 'tea', image: img('photo-1576092768241-dec231879fc3'),
        title_ru: 'Облепиховый с малиной', title_en: 'Sea buckthorn & raspberry',
        description_ru: 'Облепиха, пюре облепихи, малина, апельсиновый соус.',
        variants: [{ label: '500 мл', price: 1500 }, { label: '900 мл', price: 1700 }],
        recommendations: ['cheesecake'] },

      /* ---- Лимонады ---- */
      { id: 'lemonade-classic', sectionId: 'lemonades', image: img('photo-1621263764928-df1444c5e859'),
        title_ru: 'Классический лимонад', title_en: 'Classic lemonade',
        description_ru: 'Лимон, мята, тростниковый сахар, содовая.',
        variants: [{ label: '400 мл', price: 1200 }, { label: '1 л', price: 2500 }],
        recommendations: ['pizza-pepperoni', 'burger'] },

      /* ---- Салаты ---- */
      { id: 'caesar', sectionId: 'salads', image: img('photo-1546793665-c74683f339c1'),
        title_ru: 'Цезарь с курицей', title_en: 'Chicken Caesar',
        description_ru: 'Романо, куриное филе гриль, пармезан, гренки, соус цезарь.',
        price: 2800, recommendations: ['lemonade-classic', 'americano'] },
      { id: 'greek', sectionId: 'salads', image: img('photo-1540189549336-e6e99c3679fe'),
        title_ru: 'Овощной боул', title_en: 'Veggie bowl',
        description_ru: 'Свежие овощи, фета, киноа, оливковое масло.',
        price: 2400, recommendations: ['lemonade-classic'] },

      /* ---- Горячее ---- */
      { id: 'steak', sectionId: 'hot', image: img('photo-1600891964092-4316c288032e'),
        title_ru: 'Стейк рибай', title_en: 'Ribeye steak',
        description_ru: 'Мраморная говядина, 300 г. Подаётся с перечным соусом.',
        price: 7900, recommendations: ['caesar', 'lemonade-classic'] },
      { id: 'bolognese', sectionId: 'hot', image: img('photo-1621996346565-e3dbc646d9a9'),
        title_ru: 'Болоньезе', title_en: 'Bolognese',
        description_ru: 'Паста с томатным рагу из говядины и пармезаном.',
        price: 2900, recommendations: ['caesar', 'lemonade-classic'] },
      { id: 'burger', sectionId: 'hot', image: img('photo-1568901346375-23c9450c58cd'),
        title_ru: 'Бургер с говядиной', title_en: 'Beef burger',
        description_ru: 'Котлета 180 г, чеддер, маринованный огурец, фирменный соус.',
        price: 3200, recommendations: ['lemonade-classic'] },
      { id: 'club-sandwich', sectionId: 'hot', image: img('photo-1528735602780-2552fd46c7af'),
        title_ru: 'Клаб сэндвич с курицей', title_en: 'Chicken club sandwich',
        description_ru: 'Тостовый хлеб, курица, бекон, томаты, картофель фри.',
        price: 3300, recommendations: ['americano', 'lemonade-classic'] },

      /* ---- Пицца ---- */
      { id: 'pizza-pepperoni', sectionId: 'pizza', image: img('photo-1628840042765-356cda07504e'),
        title_ru: 'Пепперони', title_en: 'Pepperoni',
        description_ru: 'Томатный соус, моцарелла, пепперони.',
        variants: [{ label: '30 см', price: 3400 }, { label: '40 см', price: 4600 }],
        recommendations: ['lemonade-classic', 'caesar'] },
      { id: 'pizza-margherita', sectionId: 'pizza', image: img('photo-1574071318508-1cdbab80d002'),
        title_ru: 'Маргарита', title_en: 'Margherita',
        description_ru: 'Томаты, моцарелла, базилик.',
        variants: [{ label: '30 см', price: 2900 }, { label: '40 см', price: 3900 }],
        recommendations: ['lemonade-classic'] },

      /* ---- Детское ---- */
      { id: 'pancakes', sectionId: 'kids-menu', image: img('photo-1567620905732-2d1ec7ab7445'),
        title_ru: 'Панкейки', title_kk: 'Панкейктер', title_en: 'Pancakes',
        description_ru: 'С ягодами и кленовым сиропом.',
        price: 1500, recommendations: ['lemonade-classic'] },
      { id: 'kids-pizza', sectionId: 'kids-menu', image: img('photo-1513104890138-7c749659a591'),
        title_ru: 'Детская а-ля пепперони', title_en: 'Kids pepperoni',
        description_ru: 'Мини-пицца с куриной колбаской.',
        price: 2700, recommendations: ['lemonade-classic', 'pancakes'] },
      { id: 'nuggets', sectionId: 'kids-menu', image: img('photo-1562967914-608f82629710'),
        title_ru: 'Наггетсы с картофелем', title_en: 'Nuggets & fries',
        description_ru: 'Куриные наггетсы, картофель фри, кетчуп.',
        price: 1900, recommendations: ['lemonade-classic'] },

      /* ---- Десерты ---- */
      { id: 'cheesecake', sectionId: 'cakes', image: img('photo-1533134242443-d4fd215305ad'),
        title_ru: 'Чизкейк Нью-Йорк', title_en: 'New York cheesecake',
        description_ru: 'Классический сливочный чизкейк.',
        price: 1900, recommendations: ['cappuccino', 'americano'] },
      { id: 'choco-cake', sectionId: 'cakes', image: img('photo-1578985545062-69928b1d9587'),
        title_ru: 'Шоколадный торт', title_en: 'Chocolate cake',
        description_ru: 'Бисквит на бельгийском шоколаде с ганашем.',
        price: 2100, recommendations: ['flat-white', 'cappuccino'] },
      { id: 'tiramisu', sectionId: 'cakes', image: img('photo-1571877227200-a0d98ea607e9'),
        title_ru: 'Тирамису', title_en: 'Tiramisu',
        description_ru: 'Маскарпоне, савоярди, эспрессо.',
        price: 2200, recommendations: ['espresso'] }
    ]
  };
})();
