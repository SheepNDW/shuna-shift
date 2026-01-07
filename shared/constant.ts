import type { Agent } from './types';

export const IMAGE_BASE_URL = 'https://image-dev.houseprice.tw/p1-hpimage/';

export const BOOKING_URL =
  'https://inline.app/booking/-NdeCHclNdQ-Yuxen_np:inline-live-3/-NdeCHpH1ow_BuIvlFhM';

export const AGENTS = new Map<string, Agent>([
  [
    '🐷',
    {
      id: 'rin',
      name: '泠泠',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuLy1qse9mYTlDH32ZF0nMIWydusApvaojBGEb',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MDJocGltYWdl/2224de6882064993_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MDNocGltYWdl/b8ea736090a94bf5_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.rin_/',
      isFullTime: true,
    },
  ],
  [
    '🥨',
    {
      id: 'juano',
      name: '米捲',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu7J0xbXvvpE8xoHPWJ9UdMK4hqGBQZDu0XmAN',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MTdocGltYWdl/60368d70b8684442_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MThocGltYWdl/910288290eb6486d_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.juano/',
      isFullTime: true,
    },
  ],
  [
    '🌙',
    {
      id: 'luna',
      name: 'Luna',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuzacqGE5HmVSe98IXu62QYspBgGU51Owt0P3c',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MDRocGltYWdl/145a109aa9e94d06_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MTFocGltYWdl/cc2d72ab922a4333_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.luna_/',
      isFullTime: true,
    },
  ],
  [
    'Ruby',
    {
      id: 'ruby',
      name: 'Ruby',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuCBHoQf34YAXeLkv6NxtVOjMJsu01RWdITqoB',
      photos: [],
      instagram: 'https://www.instagram.com/shuna.ruby/',
    },
  ],
  [
    '梂',
    {
      id: 'chu',
      name: '梂',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuWEfQoDpc4b0vXsr7VhFqM9ZnLipjyfu2mIAN',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MjRocGltYWdl/a932f96b134c4c8d_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MjVocGltYWdl/b7e4cb7f706c411f_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.chu/',
    },
  ],
  [
    '百夜',
    {
      id: 'hyakuya',
      name: '百夜',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuNo5lFU88pmAd1J73OGKcWTRwZxlv4CI9kyLg',
      photos: [
        `${IMAGE_BASE_URL}Mzc5NDZocGltYWdl/27cb16552210421f_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5NDdocGltYWdl/52a4192a67134bf8_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.hyakuya/',
    },
  ],
  // [
  //   '凜奈',
  //   {
  //     id: 'rinna',
  //     name: '凜奈',
  //     picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuWJA9nSpc4b0vXsr7VhFqM9ZnLipjyfu2mIAN',
  //     instagram: 'https://www.instagram.com/shuna.rinna/',
  //   },
  // ],
  [
    '千熊',
    {
      id: 'senku',
      name: '千熊',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu6KxRdxfJAvDsOl9UNkiP7qSKXjIuRWradT06',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MjZocGltYWdl/a2e40d368d1c4d42_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MjdocGltYWdl/2ce2424be5f448ba_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.senku/',
    },
  ],
  [
    '熊子',
    {
      id: 'kumako',
      name: '熊子',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuBNj0lPVW0tLQAXzj1cFSCJk7agwsuPDWmhxq',
      photos: [],
      instagram: 'https://www.instagram.com/shuna.kumako/',
    },
  ],
  [
    'Kikimi',
    {
      id: 'kikimi',
      name: 'Kikimi',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuBCG3upW0tLQAXzj1cFSCJk7agwsuPDWmhxqZ',
      photos: [],
      instagram: 'https://www.instagram.com/shuna.kikimi/',
    },
  ],
  [
    '小楓',
    {
      id: 'mepuru',
      name: '小楓',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuZ8qdjuaceCOgjTpr60Y3f8w4unidbFXvkB9l',
      photos: [
        `${IMAGE_BASE_URL}Mzc5NjhocGltYWdl/1ea55fbb299144a5_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5NjlocGltYWdl/91122fcd9b5046f6_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.mepuru/',
    },
  ],
  [
    '音',
    {
      id: 'non',
      name: '音',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuuK2cuXClhNn8bH5me2PWRkg9GVoL1q6viOCw',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MzZocGltYWdl/24d6636a1a9c4a29_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MzdocGltYWdl/3bf134ea133b4602_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.non/',
    },
  ],
  [
    '花緒',
    {
      id: 'kao',
      name: '花緒',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuQfQDiPtpzcu0lMI5wN6vjb9iD3GyHLY1anXJ',
      photos: [],
      instagram: 'https://www.instagram.com/shuna.kao_/',
    },
  ],
  [
    '三里',
    {
      id: 'miri',
      name: '三里',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu81F7gUUMnaK4tR7Jbfz0B9DuAdOjWgeEI5lc',
      photos: [
        `${IMAGE_BASE_URL}Mzc5NDBocGltYWdl/8497e344e8754f30_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5NDFocGltYWdl/1a4127d475c1471d_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.miri_ps5/',
    },
  ],
  [
    '井野',
    {
      id: 'ino',
      name: '井野',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuUpzp9PkBHCabipIoGJADkslqFegBjxv6QEnc',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MzBocGltYWdl/6c4c49db2f864e96_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MzFocGltYWdl/069015a4def145dc_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.ino/',
    },
  ],
  [
    '小春',
    {
      id: 'koharu',
      name: '小春',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu1QJxdNFQhXuDmRLFk4l9Zyps5I7ztcgBGf6N',
      photos: [],
      instagram: 'https://www.instagram.com/shuna.koharu/',
    },
  ],
  [
    '綾音',
    {
      id: 'ayane',
      name: '綾音',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu0SpbxJyn8Sp9RqhgC4y0juW5saEdQbxvM7NI',
      photos: [
        `${IMAGE_BASE_URL}Mzc5NjZocGltYWdl/983b6d8b950f489a_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5NjdocGltYWdl/d7d722a8d936476c_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.ayane/',
    },
  ],
  [
    '棠棠',
    {
      id: 'tang',
      name: '棠棠',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuWE8nrzpc4b0vXsr7VhFqM9ZnLipjyfu2mIAN',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MTlocGltYWdl/b93d60821ce94ce7_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MjBocGltYWdl/77429e947682430e_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.tang/',
    },
  ],
  [
    '明里',
    {
      id: 'akari',
      name: '明里',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuTrvkSAdA95N1PDLEqaCVyK37J0cOZt8mQXIn',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MTJocGltYWdl/cf9ac7780aad43aa_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MTNocGltYWdl/e2a647501e574221_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.akari/',
    },
  ],
  [
    '酒玖',
    {
      id: 'nine',
      name: '酒玖',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuiLiBp1xAFjVWdv9lIeQuasrSZ3bRhx80gimC',
      photos: [],
      instagram: 'https://www.instagram.com/shuna.nine/',
    },
  ],
  [
    '璐奈',
    {
      id: 'runai',
      name: '璐奈',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuchDyYcnjQYKVGoj2PySknsNLbWCRdxtmHIq8',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MzhocGltYWdl/3854487b5dd7434d_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MzlocGltYWdl/c806e74254bd4349_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.runai_/',
    },
  ],
  [
    '景子',
    {
      id: 'keiko',
      name: '景子',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcumoIWb52jqZfLa4Yz1d2UTnO3AV6G7cpgyiHw',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MzRocGltYWdl/972d30b7355a4c81_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MzVocGltYWdl/ddde6a36883b49d1_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.keiko/',
    },
  ],
  [
    '莉央',
    {
      id: 'rio',
      name: '莉央',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcudNlWqsY9QEtrNiWVku3w0MsvybnKR6aXFlOe',
      photos: [
        `${IMAGE_BASE_URL}Mzc5NDRocGltYWdl/dac6f79fd2374ddf_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5NDVocGltYWdl/fad83dd43d8a4c31_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.rio/',
    },
  ],
  [
    '和実',
    {
      id: 'nagomi',
      name: '和実',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuKhFBIKgXkOU7gfRyl8YI1w4WhNSZedJjCHbc',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MjJocGltYWdl/47d8fdac28434a73_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MjNocGltYWdl/db4daf46b2744af5_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.nagomi/',
    },
  ],
  [
    '子子',
    {
      id: 'smilyzi',
      name: '子子',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcumUzNLq2jqZfLa4Yz1d2UTnO3AV6G7cpgyiHw',
      photos: [],
      instagram: 'https://www.instagram.com/shuna.smilyzi/',
    },
  ],
  [
    '芽',
    {
      id: 'yia',
      name: '芽',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuddvu6lY9QEtrNiWVku3w0MsvybnKR6aXFlOe',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MzJocGltYWdl/58e98b2412c0492d_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MzNocGltYWdl/b572eee6b3ea4de3_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.yia/',
    },
  ],
  [
    '亞米',
    {
      id: 'yami',
      name: '亞米',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcunmcVNlm1zw2bvJEWMYq7dnLm0r3cflgZeSRs',
      photos: [
        `${IMAGE_BASE_URL}Mzc5NDJocGltYWdl/2a42f9887bf74def_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5NDNocGltYWdl/8b895a566d434f37_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.yami_/',
    },
  ],
  [
    '七尾',
    {
      id: 'nanao',
      name: '七尾',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuCUMTJa34YAXeLkv6NxtVOjMJsu01RWdITqoB',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MjhocGltYWdl/d070329ef8f44ef0_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MjlocGltYWdl/5b444d5e0cbe4372_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.nanao/',
    },
  ],
]);
