// ============================================================
// Shuna — Mock data for the redesign prototype
// Agent names and photos lifted from shared/constant.ts.
// Schedules are fabricated for demonstration.
// ============================================================

const IMG = "https://image-dev.houseprice.tw/p1-hpimage/";

const AGENTS = [
  // —— 正職 ——
  { id: "rin", name: "泠泠", emoji: "🐷", color: "#c97a72", fullTime: true,
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuLy1qse9mYTlDH32ZF0nMIWydusApvaojBGEb",
    instagram: "https://www.instagram.com/shuna.rin_/",
    bio: "招牌粉紅小豬・店內招牌甜點研究擔當" },
  { id: "juano", name: "米捲", emoji: "🥨", color: "#a87b3a", fullTime: true,
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu7J0xbXvvpE8xoHPWJ9UdMK4hqGBQZDu0XmAN",
    instagram: "https://www.instagram.com/shuna.juano/",
    bio: "椒鹽脆餅・最會記客人喜好的探員" },
  { id: "luna", name: "Luna", emoji: "🌙", color: "#4a5f8b", fullTime: true,
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuzacqGE5HmVSe98IXu62QYspBgGU51Owt0P3c",
    instagram: "https://www.instagram.com/shuna.luna_/",
    bio: "夜半月色・店內音樂歌單選曲師" },
  { id: "mikan", name: "蜜柑", emoji: "🍊", color: "#d2832a", fullTime: true,
    picture: IMG + "MzgxNzNocGltYWdl/96c92060c9b34fe2_1440x1440.jpg",
    instagram: "https://www.instagram.com/shuna.mikan/",
    bio: "明亮橘色・新探員指導擔當" },

  // —— 現役 ——
  { id: "ruby", name: "Ruby", color: "#b8425a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuCBHoQf34YAXeLkv6NxtVOjMJsu01RWdITqoB",
    instagram: "https://www.instagram.com/shuna.ruby/", bio: "紅寶石光澤" },
  { id: "chu", name: "梂", color: "#6b7f4a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuWEfQoDpc4b0vXsr7VhFqM9ZnLipjyfu2mIAN",
    instagram: "https://www.instagram.com/shuna.chu/", bio: "森林綠調" },
  { id: "hyakuya", name: "百夜", color: "#2a3a5a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuNo5lFU88pmAd1J73OGKcWTRwZxlv4CI9kyLg",
    instagram: "https://www.instagram.com/shuna.hyakuya/", bio: "深夜靛藍" },
  { id: "senku", name: "千熊", color: "#8b5a3a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu6KxRdxfJAvDsOl9UNkiP7qSKXjIuRWradT06",
    instagram: "https://www.instagram.com/shuna.senku/", bio: "棕熊溫度" },
  { id: "kumako", name: "熊子", color: "#a25e3e",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuBNj0lPVW0tLQAXzj1cFSCJk7agwsuPDWmhxq",
    instagram: "https://www.instagram.com/shuna.kumako/", bio: "小熊軟糖" },
  { id: "mepuru", name: "小楓", color: "#c8a242",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuZ8qdjuaceCOgjTpr60Y3f8w4unidbFXvkB9l",
    instagram: "https://www.instagram.com/shuna.mepuru/", bio: "秋日楓葉" },
  { id: "non", name: "音", color: "#5a4a8b",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuuK2cuXClhNn8bH5me2PWRkg9GVoL1q6viOCw",
    instagram: "https://www.instagram.com/shuna.non/", bio: "音符紫" },
  { id: "kao", name: "花緒", color: "#c8628b",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuQfQDiPtpzcu0lMI5wN6vjb9iD3GyHLY1anXJ",
    instagram: "https://www.instagram.com/shuna.kao_/", bio: "花瓣粉紅" },
  { id: "miri", name: "三里", color: "#6a8aa8",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu81F7gUUMnaK4tR7Jbfz0B9DuAdOjWgeEI5lc",
    instagram: "https://www.instagram.com/shuna.miri_ps5/", bio: "天藍水色" },
  { id: "ino", name: "井野", color: "#7a8a4a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuUpzp9PkBHCabipIoGJADkslqFegBjxv6QEnc",
    instagram: "https://www.instagram.com/shuna.ino/", bio: "井邊綠草" },
  { id: "koharu", name: "小春", color: "#d28a7a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu1QJxdNFQhXuDmRLFk4l9Zyps5I7ztcgBGf6N",
    instagram: "https://www.instagram.com/shuna.koharu/", bio: "春日杏色" },
  { id: "ayane", name: "綾音", color: "#7a5a8b",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcu0SpbxJyn8Sp9RqhgC4y0juW5saEdQbxvM7NI",
    instagram: "https://www.instagram.com/shuna.ayane/", bio: "綾紋之紫" },
  { id: "tang", name: "棠棠", color: "#a8527a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuWE8nrzpc4b0vXsr7VhFqM9ZnLipjyfu2mIAN",
    instagram: "https://www.instagram.com/shuna.tang/", bio: "海棠花色" },
  { id: "akari", name: "明里", color: "#d2a55a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuTrvkSAdA95N1PDLEqaCVyK37J0cOZt8mQXIn",
    instagram: "https://www.instagram.com/shuna.akari/", bio: "晨光金黃" },
  { id: "nine", name: "酒玖", color: "#9a3a3a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuiLiBp1xAFjVWdv9lIeQuasrSZ3bRhx80gimC",
    instagram: "https://www.instagram.com/shuna.nine/", bio: "琥珀酒色" },
  { id: "runai", name: "璐奈", color: "#5a7a8a",
    picture: "https://o8ilaibv5w.ufs.sh/f/Q681AB1tpzcuchDyYcnjQYKVGoj2PySknsNLbWCRdxtmHIq8",
    instagram: "https://www.instagram.com/shuna.runai_/", bio: "玻璃藍綠" },
];

const AGENT_MAP = new Map(AGENTS.map((a) => [a.name, a]));

// ============================================================
// Generate 14 days of schedules around "today"
// ============================================================
function pad(n) { return String(n).padStart(2, "0"); }
function ymd(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function md(d) { return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`; }

const DOW = ["日", "一", "二", "三", "四", "五", "六"];

// Deterministic-ish pseudo-random based on seed (day index)
function pick(arr, n, seed) {
  const result = [];
  const pool = [...arr];
  let s = seed;
  while (result.length < n && pool.length) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

const DAY_BG = [
  "#fde8d0", "#f7e1cc", "#f4dccd", "#f9e6d4", "#fdebd9",
  "#f0e2cc", "#f7dcc8", "#ffe2cf", "#f8e4d2", "#fbe6d0",
];

const DESCRIPTIONS = [
  "店休日", "限定企劃 — 草莓季", "新人見習日", "週末加開",
  "限定服裝日", "夜間限定甜點", "週中安靜日", "情人節企劃",
  "店長休假", "黑膠音樂夜",
];

function buildSchedules() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const schedules = [];

  for (let offset = -3; offset <= 10; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const seed = (offset + 100) * 13 + 7;

    const isClosed = (offset === 4) || (offset === 8); // a couple of off-days

    const dayCount = isClosed ? 0 : 2 + (seed % 3); // 2-4
    const nightCount = isClosed ? 0 : 2 + ((seed * 3) % 3); // 2-4

    const dayAgents = pick(AGENTS, dayCount, seed);
    const nightAgents = pick(AGENTS.filter(a => !dayAgents.includes(a)), nightCount, seed + 999);

    const hasDescription = (seed % 5 === 0) || isClosed;
    schedules.push({
      date: {
        iso: ymd(d),
        datetime: md(d),
        dow: DOW[d.getDay()],
        backgroundColor: hasDescription ? DAY_BG[Math.abs(offset) % DAY_BG.length] : null,
        description: isClosed ? "店休日" : (hasDescription ? DESCRIPTIONS[Math.abs(offset) % DESCRIPTIONS.length] : null),
      },
      isToday: offset === 0,
      isClosed,
      day:   dayAgents.map(a => ({ name: a.name, textColor: a.color })),
      night: nightAgents.map(a => ({ name: a.name, textColor: a.color })),
    });
  }
  return schedules;
}

const SCHEDULES = buildSchedules();

// ============================================================
// Statistics — past 3 months counts
// ============================================================
const STATISTICS = AGENTS.map((a, i) => {
  const seed = (i + 1) * 7;
  const dayCount = 8 + (seed % 14);
  const nightCount = 6 + ((seed * 3) % 13);
  return {
    agentId: a.id,
    name: a.name,
    picture: a.picture,
    color: a.color,
    fullTime: !!a.fullTime,
    dayCount,
    nightCount,
    total: dayCount + nightCount,
  };
}).sort((a, b) => b.total - a.total);

// expose globally for babel-transformed scripts
window.SHUNA_DATA = { AGENTS, AGENT_MAP, SCHEDULES, STATISTICS };
