export type TSubscription = {
  name: string;
  type?: 'dg-pro' | 'dg-team';
  price?: Array<{
    period: number;
    value: number;
    monthPrice: number;
  }>;
  features: Array<{
    translations: Record<string, string>;
    available: boolean;
  }>;
};

export const SUBSCRIPTION_LIST: TSubscription[] = [
  {
    name: 'DG FREE',
    price: undefined,
    features: [
      {
        translations: {
          ru: 'Неограниченный доступ к просмотру доступных гайдов',
          uk: 'Необмежений доступ до перегляду доступних гайдів',
          en: 'Unlimited access to view available guides',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Доступ к ограниченному набору услуг в магазине',
          uk: 'Доступ до обмеженого набору послуг у магазині',
          en: 'Access to a limited range of services in the store',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Доступ к базе знаний',
          uk: 'Доступ до бази знань',
          en: 'Access to the knowledge base',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Без командного трекера',
          uk: 'Без командного трекера',
          en: 'Without command tracker',
        },
        available: false,
      },
      {
        translations: {
          ru: 'Календарь фарма',
          uk: 'Календар фарма',
          en: 'Farm calendar',
        },
        available: false,
      },
      {
        translations: {
          ru: 'Без субаккаунтов',
          uk: 'Без субакаунтів',
          en: 'No sub-accounts',
        },
        available: false,
      },
      {
        translations: {
          ru: 'Без уведомлений',
          uk: 'Без повідомлень',
          en: 'No notifications',
        },
        available: false,
      },
      {
        translations: {
          ru: 'Нет доступа к “Гемам”',
          uk: 'Немає доступу до "Гем"',
          en: 'No access to "Gems"',
        },
        available: false,
      },
      {
        translations: {
          ru: 'Нет приватного канала',
          uk: 'Немає приватного каналу',
          en: 'No private channel',
        },
        available: false,
      },
    ],
  },
  {
    type: 'dg-pro',
    name: 'DG PRO',
    price: [
      {
        period: 90,
        value: 109,
        monthPrice: 36,
      },
      {
        period: 182,
        value: 179,
        monthPrice: 29,
      },
      {
        period: 365,
        value: 279,
        monthPrice: 23,
      },
    ],
    features: [
      {
        translations: {
          ru: 'Всё из FREE',
          uk: 'Все з FREE',
          en: 'All from FREE',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Уведомления о новых фармах (бот)',
          uk: 'Повідомлення про нові фарми (бот)',
          en: 'Notifications about new farms (bot)',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Приватный Telegram-канал',
          uk: 'Приватний Telegram-канал',
          en: 'Private Telegram channel',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Вкладка "Гемы" (топ-активности)',
          uk: 'Вкладка "Геми" (топ-активності)',
          en: 'Gems tab (top activities)',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Доступ к эксклюзивным заданиям',
          uk: 'Доступ до ексклюзивних завдань',
          en: 'Access to exclusive tasks',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Ежемесячная консультация (30 мин)',
          uk: 'Monthly consultation (30 min)',
          en: 'Щомісячна консультація (30 хв)',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Доступ к неограниченному набору услуг в магазине',
          uk: 'Доступ до необмеженого набору послуг у магазині',
          en: 'Access to an unlimited range of services in the store',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Без командного трекера',
          uk: 'Без командного трекера',
          en: 'Without command tracker',
        },
        available: false,
      },
      {
        translations: {
          ru: 'Без субаккаунтов',
          uk: 'Без субакаунтів',
          en: 'No sub-accounts',
        },
        available: false,
      },
    ],
  },
  {
    type: 'dg-team',
    name: 'DG PRO',
    price: [
      {
        period: 90,
        value: 109,
        monthPrice: 36,
      },
      {
        period: 182,
        value: 179,
        monthPrice: 29,
      },
      {
        period: 365,
        value: 279,
        monthPrice: 23,
      },
    ],
    features: [
      {
        translations: {
          ru: 'Всё из FREE',
          uk: 'Все з FREE',
          en: 'All from FREE',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Уведомления о новых фармах (бот)',
          uk: 'Повідомлення про нові фарми (бот)',
          en: 'Notifications about new farms (bot)',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Приватный Telegram-канал',
          uk: 'Приватний Telegram-канал',
          en: 'Private Telegram channel',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Вкладка "Гемы" (топ-активности)',
          uk: 'Вкладка "Геми" (топ-активності)',
          en: 'Gems tab (top activities)',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Доступ к эксклюзивным заданиям',
          uk: 'Доступ до ексклюзивних завдань',
          en: 'Access to exclusive tasks',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Ежемесячная консультация (30 мин)',
          uk: 'Monthly consultation (30 min)',
          en: 'Щомісячна консультація (30 хв)',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Доступ к неограниченному набору услуг в магазине',
          uk: 'Доступ до необмеженого набору послуг у магазині',
          en: 'Access to an unlimited range of services in the store',
        },
        available: true,
      },
      {
        translations: {
          ru: 'Без командного трекера',
          uk: 'Без командного трекера',
          en: 'Without command tracker',
        },
        available: false,
      },
      {
        translations: {
          ru: 'Без субаккаунтов',
          uk: 'Без субакаунтів',
          en: 'No sub-accounts',
        },
        available: false,
      },
    ],
  },
  // {
  //   type: 'dg-team',
  //   name: 'DG TEAM',
  //   price: [
  //     {
  //       period: 90,
  //       value: 199,
  //       monthPrice: 66,
  //     },
  //     {
  //       period: 182,
  //       value: 299,
  //       monthPrice: 49,
  //     },
  //     {
  //       period: 365,
  //       value: 499,
  //       monthPrice: 41,
  //     },
  //   ],
  //   features: [
  //     {
  //       translations: {
  //         ru: 'Всё из PRO',
  //         uk: 'All from PRO',
  //         en: 'Все з PRO',
  //       },
  //       available: true,
  //     },
  //     {
  //       translations: {
  //         ru: 'Подключение до 15 субаккаунтов',
  //         uk: 'Підключення до 15 субакаунтів',
  //         en: 'Connect up to 15 sub-accounts',
  //       },
  //       available: true,
  //     },
  //     {
  //       translations: {
  //         ru: 'Командный таскер',
  //         uk: 'Командний таскер',
  //         en: 'Team Tasker',
  //       },
  //       available: true,
  //     },
  //     {
  //       translations: {
  //         ru: 'Ежемесячная консультация (60 мин)',
  //         uk: 'Щомісячна консультація (60 хв)',
  //         en: 'Monthly consultation (60 min)',
  //       },
  //       available: true,
  //     },
  //     {
  //       translations: {
  //         ru: 'Приоритетная поддержка',
  //         uk: 'Пріоритетна підтримка',
  //         en: 'Priority support',
  //       },
  //       available: true,
  //     },
  //     {
  //       translations: {
  //         ru: 'Отчёты по активности команды',
  //         uk: 'Звіти щодо активності команди',
  //         en: 'Team Activity Reports',
  //       },
  //       available: true,
  //     },
  //     {
  //       translations: {
  //         ru: 'Специальные тарифы на некоторые услуги в магазине',
  //         uk: 'Спеціальні тарифи на деякі послуги у магазині',
  //         en: 'Special rates for some services in the store',
  //       },
  //       available: true,
  //     },
  //   ],
  // },
];
