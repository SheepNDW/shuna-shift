import type { Agent } from './types';

export const IMAGE_BASE_URL = 'https://image-dev.houseprice.tw/p1-hpimage/';

/**
 * 探員名稱別名對照表（非 emoji 的變體寫法）。
 *
 * emoji → 正式名稱的對應改由 `AGENTS` 各 entry 的 `emoji` 欄位自動建立
 * （見 {@link EMOJI_TO_NAME}），不再於此手動維護。
 */
export const NAME_ALIASES: ReadonlyMap<string, string> = new Map([['いろは', 'Iroha']]);

/**
 * 正規化探員名稱，將表單中的變體寫法對應回 `AGENTS` 的正式名稱鍵值。
 * 1. emoji → 正式名稱（由 `AGENTS` 的 `emoji` 欄位自動建立）
 * 2. 名稱別名對照表完全匹配
 * 3. 不區分大小寫比對 `AGENTS` 的鍵值
 * 若均無匹配則回傳原名稱。
 */
export function normalizeAgentName(name: string): string {
  // 1. emoji → 正式名稱
  const nameFromEmoji = EMOJI_TO_NAME.get(name);
  if (nameFromEmoji) {
    return nameFromEmoji;
  }

  // 2. 名稱別名完全匹配
  const alias = NAME_ALIASES.get(name);
  if (alias) {
    return alias;
  }

  // 3. 不區分大小寫比對 AGENTS 鍵值
  const lowerName = name.toLowerCase();
  for (const key of AGENTS.keys()) {
    if (key.toLowerCase() === lowerName) {
      return key;
    }
  }

  return name;
}

export const BOOKING_URL =
  'https://inline.app/booking/-NdeCHclNdQ-Yuxen_np:inline-live-3/-NdeCHpH1ow_BuIvlFhM';

/**
 * 跨頁面共用的「探員優先順序」陣列：排在正職之後、其餘探員之前的偏好順位。
 * Phase 4 篩選列、Phase 6 統計頁等任何「需排序探員清單」之處可重用。
 */
export const AGENT_FILTER_PRIORITY: readonly string[] = ['景子', '和実', '音', '芽', '百夜'];

/** 班表資料來源（公開的 Google 試算表）。其 ID 與後端 `NUXT_SPREADSHEET_ID` 為同一份。 */
export const SCHEDULE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1Fe39ZrJdp8LFIIg886VoqiAC6H5k8Td4fwZVp85sInw/';

export const AGENTS = new Map<string, Agent>([
  [
    '泠泠',
    {
      id: 'rin',
      name: '泠泠',
      emoji: '🐷',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuLy1qse9mYTlDH32ZF0nMIWydusApvaojBGEb',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MDJocGltYWdl/2224de6882064993_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MDNocGltYWdl/b8ea736090a94bf5_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.rin_/',
      isFullTime: true,
      themeColor: '群青 ｸﾞﾝｼﾞｮｳ',
      birthday: '02.20',
      skills: ['找東西', '綁蝴蝶結'],
      hobbies: ['去圖書館', '看小豬直播'],
      quote: '今天是我們的天下，又是沒有大人的一天✨',
    },
  ],
  [
    '米捲',
    {
      id: 'juano',
      name: '米捲',
      emoji: '🥨',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu7J0xbXvvpE8xoHPWJ9UdMK4hqGBQZDu0XmAN',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MTdocGltYWdl/60368d70b8684442_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MThocGltYWdl/910288290eb6486d_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.juano/',
      isFullTime: true,
      themeColor: '菜の花 ﾅﾉﾊﾅ',
      birthday: '10.16',
      skills: ['胡言亂語'],
      hobbies: ['高速婆婆', '薑餅人', '崔立于'],
      quote: '本人來了，本人就是本人想來就來。',
    },
  ],
  [
    'Luna',
    {
      id: 'luna',
      name: 'Luna',
      emoji: '🌙',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuzacqGE5HmVSe98IXu62QYspBgGU51Owt0P3c',
      photos: [
        `${IMAGE_BASE_URL}Mzc5MDRocGltYWdl/145a109aa9e94d06_1440x1440.jpg`,
        `${IMAGE_BASE_URL}Mzc5MTFocGltYWdl/cc2d72ab922a4333_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.luna_/',
      isFullTime: true,
      themeColor: '紅碧 ﾍﾞﾆﾐﾄﾞﾘ',
      birthday: '07.29',
      skills: ['叫大家Shot掉熱茶', '早餐吃播'],
      hobbies: ['TRPG', '17'],
      quote: '早安、掰掰、路上小心 .｡.:*♡',
    },
  ],
  [
    'Ruby',
    {
      id: 'ruby',
      name: 'Ruby',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuCBHoQf34YAXeLkv6NxtVOjMJsu01RWdITqoB',
      photos: [
        `${IMAGE_BASE_URL}MzgwOTBocGltYWdl/c04347f000c04a5b_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgwOTFocGltYWdl/332146c50dec4f8c_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.ruby/',
      themeColor: '灰桜 ﾊｲｻﾞｸﾗ',
      birthday: '08.09',
      skills: ['假裝人類'],
      hobbies: ['躲兔子洞'],
      quote: '這次抓得到Ruby嗎？前輩🐰🩶',
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
      themeColor: '半 ﾊｼﾀ',
      birthday: '08.07',
      skills: ['放空', '睡一整天'],
      hobbies: ['無尾熊🐨', '諧音梗笑話'],
      quote: '今天也是想睡覺的一天ᶻ 𝗓 𐰁',
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
      themeColor: '白練 ｼﾛﾈﾘ',
      birthday: '05.21',
      skills: ['人類觀察'],
      hobbies: ['淺羽悠真'],
      quote: '當我拿起刀，就要切蛋糕(๑˃ᴗ˂)ﻭ🔪',
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
      themeColor: '呂 ﾛ',
      birthday: '11.20',
      skills: ['人格分裂', '瞬間厭世'],
      hobbies: ['0（可能跳舞吧？'],
      quote: '喔。是喔⋯⋯好喔。',
    },
  ],
  [
    '熊子',
    {
      id: 'kumako',
      name: '熊子',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuBNj0lPVW0tLQAXzj1cFSCJk7agwsuPDWmhxq',
      photos: [
        `${IMAGE_BASE_URL}MzgwOTRocGltYWdl/4c31835d571e4427_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgwOTVocGltYWdl/07ecd7f8ff204390_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.kumako/',
      themeColor: '空 ｿﾗ / 社畜黑',
      birthday: '06.22',
      skills: ['皇帝企鵝二號', '民刑事訴訟'],
      hobbies: ['以100為單位抽一番賞', '周深', '閃電十一人'],
      quote: '詐騙手法日益新，你我務必要小心；遇到可疑人事物請記得撥打165反詐專線或聯繫熊律師。',
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
      isGraduated: true,
      themeColor: '珊瑚珠 ｻﾝｺﾞｼｭ',
      birthday: '03.04',
      skills: ['30秒畫盤'],
      hobbies: ['愛生氣'],
      quote: '人生夢想💭吃飽、喝足、睡大覺',
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
      themeColor: '勿忘草 ﾜｽﾚﾅｸﾞｻ',
      birthday: '10.22',
      skills: ['分身術'],
      hobbies: ['跳舞', '喜歡我的人'],
      quote: '天靈靈地靈靈 存款變成零✨',
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
      themeColor: '今様 ｲﾏﾖｳ',
      birthday: '10.11',
      skills: ['笑點很低', '喝全糖珍奶'],
      hobbies: ['打瓦', '追星', '崔太洋', '兔兔小章魚'],
      quote: '見面以解鎖更多崔音音ㄉ不同面貌‎ദ്ദിᵔ.˛.ᵔ₎',
    },
  ],
  [
    '花緒',
    {
      id: 'kao',
      name: '花緒',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuQfQDiPtpzcu0lMI5wN6vjb9iD3GyHLY1anXJ',
      photos: [
        `${IMAGE_BASE_URL}MzgwOTJocGltYWdl/b2bd988beec44979_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgwOTNocGltYWdl/bf7aad5b4f734e58_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.kao_/',
      isGraduated: true,
      themeColor: '薄紅 ｳｽﾍﾞﾆ',
      birthday: '06.05',
      skills: ['說服自己'],
      hobbies: ['吃甜點', '小森結菜'],
      quote: '蛋糕兩塊不夠就來三塊 ·͜·♡',
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
      themeColor: '紺 ｺﾝ',
      birthday: '06.10',
      skills: ['幫娃娃配音', '複製文朗讀'],
      hobbies: ['中華風🥟', '博美狗', '日團'],
      quote: '前輩們努力點，才能讓我吃上360塊的鹹酥雞。',
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
      themeColor: '瓶覗 ｶﾒﾉｿﾞｷ',
      birthday: '07.01',
      skills: ['單吃調味粉', '情勒探員‎ദ്ദിᵔ.˛.ᵔ₎'],
      hobbies: ['狐波ろん🦊', '假面騎士🐃'],
      quote: '嬰兒…想睡覺ㄌ…💤',
    },
  ],
  [
    '小春',
    {
      id: 'koharu',
      name: '小春',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu1QJxdNFQhXuDmRLFk4l9Zyps5I7ztcgBGf6N',
      photos: [
        `${IMAGE_BASE_URL}MzgwOTlocGltYWdl/79532f302008422d_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgxMDBocGltYWdl/180757b1aec64c3e_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.koharu/',
      themeColor: '長春 ﾁｮｳｼｭｳ',
      birthday: '03.29',
      skills: ['已讀亂回（確實）'],
      hobbies: ['唱歌', '金碩珍'],
      quote: '當有人問我存了多少\n我存活下來了🫴🏻',
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
      themeColor: '山吹 ﾔﾏﾌﾞｷ',
      birthday: '03.24',
      skills: ['把杯子裡的水加滿'],
      hobbies: ['跳舞', '吃甜點', '貓咪', '小八', '傑利鼠', '線條小狗'],
      quote: '期待每一次與你/妳相遇💛',
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
      isGraduated: true,
      themeColor: '玉子 ﾀﾏｺﾞ',
      birthday: '01.10',
      skills: ['忍術'],
      hobbies: ['易容', '花錢', '當夢女'],
      quote: '運氣也是一種實力୧(୧ˊ͈ ³ ˋ͈)⋆ೄ',
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
      isGraduated: true,
      themeColor: '赤紅 ｱｶﾍﾞﾆ',
      birthday: '03.31',
      skills: ['夜間巡邏', '證據蒐集📸'],
      hobbies: ['觀察紀錄可愛又危險的東西💪'],
      quote: '𝕺𝖓𝖑𝖞 𝖞𝖔𝖚 𝖇𝖗𝖎𝖓𝖌 𝖒𝖊 𝖇𝖆𝖈𝖐 𝖙𝖔 𝖑𝖎𝖋𝖊',
    },
  ],
  [
    '酒玖',
    {
      id: 'nine',
      name: '酒玖',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuiLiBp1xAFjVWdv9lIeQuasrSZ3bRhx80gimC',
      photos: [
        `${IMAGE_BASE_URL}MzgwOTdocGltYWdl/bd52f9237dd9464b_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgwOThocGltYWdl/80e600073dd14124_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.nine/',
      themeColor: '白綠 ﾋﾞｬｸﾛｸ',
      birthday: '03.21',
      skills: ['動森語'],
      hobbies: ['魔法', '奶茶', '貓'],
      quote: '前輩，會魔法的奶茶口味貓貓難道不是世界上最完美的東西嗎？',
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
      themeColor: '紫苑 ｼｵﾝ',
      birthday: '08.29',
      skills: ['日本當高雄跑', '厭世臉'],
      hobbies: ['張員瑛'],
      quote: '肚子好餓 想不到晚餐要吃什麼ᑦ꒰ྀིྀི ˃̶̤́ ࿁ ˂̶̤̀ ྀྀི꒱ᐣ',
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
      themeColor: '深川鼠 ﾌｶｶﾞﾜﾈﾂﾐ',
      birthday: '09.29',
      skills: ['可以睡12小時不起來'],
      hobbies: ['吃酸辣粉', '打瓦羅蘭', '喝阿華田', '聽Ado'],
      quote: '夢想是睡飽吃吃飽睡，聽一整天的Ado跟ファントムシータ',
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
      themeColor: '狐 ｷﾂﾈ',
      birthday: '10.05',
      skills: ['一天分享30篇廢文'],
      hobbies: ['電競', 'Faker'],
      quote: '能把燈關掉嗎👋🤦‍♂️ 😈\n我要看看我的記憶體...💥 ⚡\n啊啊...無限的...炫酷RGB🌈 🦄',
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
      themeColor: '深緋 ｺｷﾋ',
      birthday: '08.16',
      skills: ['🔥火焰踢'],
      hobbies: ['撿樹枝'],
      quote: '我是一隻蛞蝓。',
    },
  ],
  [
    '子子',
    {
      id: 'smilyzi',
      name: '子子',
      picture: 'https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcumUzNLq2jqZfLa4Yz1d2UTnO3AV6G7cpgyiHw',
      photos: [
        `${IMAGE_BASE_URL}MzgxMDFocGltYWdl/1d6e7e93aa5041a9_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgxMDJocGltYWdl/5084789908b9459b_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.smilyzi/',
      themeColor: '藤黃 ﾄｳｵｳ',
      birthday: '06.18',
      skills: ['分身'],
      hobbies: ['猜星座'],
      quote: '興趣是吃、散步、還有吃唷！',
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
      themeColor: '鶯 ｳｸﾞｲｽ',
      birthday: '06.27',
      skills: [
        '畫很多抽象的軟爛生物',
        '誇好可愛bot',
        '做會被警察抓走的事但還沒被抓走',
      ],
      hobbies: ['嘗試成為美少女身上的掛件（成功率99%）'],
      quote: '前輩我們蹲下好不好⊂( ᴖ ̫ᴖ )⊃\n聽說沒蹲下來的前輩都被我種到土裡了',
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
      themeColor: '白茶 ｼﾗﾁｬ',
      birthday: '08.10',
      skills: ['畫咖波', '一年中有360天戴假髮上班'],
      hobbies: ['奶茶', '咖波'],
      quote: '是Yami不是Yummy',
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
      themeColor: '韓紅花 ｶﾗｸﾚﾅｲ',
      birthday: '02.19',
      skills: ['日夜顛倒'],
      hobbies: ['唱歌', '看舞台劇', '巴日和☀️'],
      quote: '汪汪🐶',
    },
  ],
  [
    '蜜柑',
    {
      id: 'mikan',
      name: '蜜柑',
      emoji: '🍊',
      picture: `${IMAGE_BASE_URL}MzgxNzNocGltYWdl/96c92060c9b34fe2_1440x1440.jpg`,
      photos: [
        `${IMAGE_BASE_URL}MzgxNzNocGltYWdl/96c92060c9b34fe2_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgxNzRocGltYWdl/e9aea30b5a5e4504_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.mikan/',
      isFullTime: true,
      themeColor: '花葉 ﾊﾅﾊﾞ',
      birthday: '07.22',
      skills: ['吃播', '喜歡都銀虎'],
      hobbies: ['重訓', '體驗新事物'],
      quote: '前輩你看我的二頭肌✨ᕦ( ⍢ )ᕤ✨',
    },
  ],
  [
    '悠莉',
    {
      id: 'yuri',
      name: '悠莉',
      picture: `${IMAGE_BASE_URL}MzgzMzZocGltYWdl/b1831cc8181e46b6_1440x1440.jpg`,
      photos: [
        `${IMAGE_BASE_URL}MzgzMzZocGltYWdl/b1831cc8181e46b6_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgzMzdocGltYWdl/628abe051a52493f_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.yuri_/',
      themeColor: '水 ﾐｽﾞ',
      birthday: '10.08',
      skills: ['問問題'],
      hobbies: ['小波', '問前輩你有多高'],
      quote: '咖喱飯絕對不拌派',
    },
  ],
  [
    '律',
    {
      id: 'ritsu',
      name: '律',
      picture: `${IMAGE_BASE_URL}MzgzMzhocGltYWdl/339c463fcc414b36_1440x1440.jpg`,
      photos: [
        `${IMAGE_BASE_URL}MzgzMzhocGltYWdl/339c463fcc414b36_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgzMzlocGltYWdl/210fcc13cbbc4d45_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.ritsu/',
      themeColor: '鶯茶 ｳｸﾞｲｽﾁｬ',
      birthday: '03.28',
      skills: ['壓榨錢包', '當機'],
      hobbies: ['唱歌', '月島螢', '聽AI唸小說'],
      quote: '您已達到免費試用方案的使用上限，請稍後再試，或切換至 ChatRITSU 其他模型以繼續使用。',
    },
  ],
  [
    'Iroha',
    {
      id: 'iroha',
      name: 'Iroha',
      picture: `${IMAGE_BASE_URL}MzgzNTFocGltYWdl/9a829da0bef14b6f_1440x1440.jpg`,
      photos: [
        `${IMAGE_BASE_URL}MzgzNTFocGltYWdl/9a829da0bef14b6f_1440x1440.jpg`,
        `${IMAGE_BASE_URL}MzgzNTJocGltYWdl/d078eec3eaae4b1c_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.iroha/',
      themeColor: '木賊 ﾄｸｻ',
      birthday: '01.22',
      skills: ['感應水晶'],
      hobbies: ['聽吹風機的聲音'],
      quote: '不要騙我，我很容易被騙ʘ̅͜ʘ̅',
    },
  ],
  [
    '芙理',
    {
      id: 'furi',
      name: '芙理',
      picture: `${IMAGE_BASE_URL}NDE5NDNocGltYWdl/030bd21df05844c5_1440x1440.jpg`,
      photos: [
        `${IMAGE_BASE_URL}NDE5NDNocGltYWdl/030bd21df05844c5_1440x1440.jpg`,
        `${IMAGE_BASE_URL}NDE5NDdocGltYWdl/9a62d830aac44198_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.furi/',
      themeColor: '一斥染 ｲｯｺﾝｿﾞﾒ',
      birthday: '01.12',
      skills: ['攪拌'],
      hobbies: ['變裝癖aka cosplay'],
      quote: '人生には、アザラシと冒険が必要だ。',
    },
  ],
  [
    '千佳',
    {
      id: 'chika',
      name: '千佳',
      picture: `${IMAGE_BASE_URL}NDE5NDRocGltYWdl/d75854be98e0484f_1440x1440.jpg`,
      photos: [
        `${IMAGE_BASE_URL}NDE5NDRocGltYWdl/d75854be98e0484f_1440x1440.jpg`,
        `${IMAGE_BASE_URL}NDE5NDhocGltYWdl/818d087385314ea3_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.chika/',
      themeColor: '舛花 ﾏｽﾊﾅ',
      birthday: '08.18',
      skills: ['重複聽同一首歌一個月'],
      hobbies: ['可愛動物', '狗丸透真'],
      quote: '在哪裡跌倒就在哪裡躺一下ʕ •ᴥ•ʔ',
    },
  ],
  [
    '日和',
    {
      id: 'hiyori',
      name: '日和',
      picture: `${IMAGE_BASE_URL}NDE5NDVocGltYWdl/a46a1579bc7943c4_1440x1440.jpg`,
      photos: [
        `${IMAGE_BASE_URL}NDE5NDVocGltYWdl/a46a1579bc7943c4_1440x1440.jpg`,
        `${IMAGE_BASE_URL}NDE5NDlocGltYWdl/f500782c7c25412d_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.hiyori/',
      themeColor: '桃 ﾓﾓ',
      birthday: '08.25',
      skills: ['吃東西', '亂花錢', '喝一杯飲料喝一整天還沒喝完'],
      hobbies: ['小麥粉精靈', '小八', '各種可愛的東西', '水蜜桃', '甜點', '手搖杯', '金泰亨'],
      quote: '錢景一片大好ᔦ ° ꒳ ° ᔨ ̖́-',
    },
  ],
  [
    '香草',
    {
      id: 'banira',
      name: '香草',
      picture: `${IMAGE_BASE_URL}NDE5NDZocGltYWdl/c90fa55275a74feb_1440x1440.jpg`,
      photos: [
        `${IMAGE_BASE_URL}NDE5NDZocGltYWdl/c90fa55275a74feb_1440x1440.jpg`,
        `${IMAGE_BASE_URL}NDE5NTBocGltYWdl/3aa3f147305a4171_1440x1440.jpg`,
      ],
      instagram: 'https://www.instagram.com/shuna.banira/',
      themeColor: '月白 ｹﾞｯﾊﾟｸ',
      birthday: '08.11',
      skills: ['暴言'],
      hobbies: ['純喫綠', '美樂蒂'],
      quote: '不出意外的話會出意外。',
    },
  ],
]);

/**
 * emoji → 正式名稱查表，由 `AGENTS` 各 entry 的 `emoji` 欄位自動建立。
 *
 * 新增／調整探員 emoji 時只需維護 `AGENTS`，此表會自動同步，
 * 不必再手動維護 emoji 別名。
 */
export const EMOJI_TO_NAME: ReadonlyMap<string, string> = new Map(
  Array.from(AGENTS.values())
    .filter((agent): agent is Agent & { emoji: string } => Boolean(agent.emoji))
    .map((agent) => [agent.emoji, agent.name]),
);
