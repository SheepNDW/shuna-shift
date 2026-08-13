import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RowData, ShiftSchedule } from '~~/shared/types';
import { isoToDateLabel } from '~~/shared/utils/date';
import {
  calculateAgentStatistics,
  extractAgentName,
  filterRecentMonths,
  findAgentByName,
  getDateRange,
  getLastScheduleIso,
  resolveStatisticsEndIso,
} from '../statistics';
import { transformSheetDataToSchedules } from '../transformer';

/**
 * 以 ISO 日期建一筆班表；顯示標籤一律由 iso 導出，fixture 不會出現
 * 「iso 與 datetime 對不起來」這種真實資料裡不可能發生的組合。
 */
const scheduleAt = (
  iso: string,
  dayAgents: { name: string; textColor: string }[] = [],
  nightAgents: { name: string; textColor: string }[] = [],
): ShiftSchedule => ({
  date: { iso, datetime: isoToDateLabel(iso), backgroundColor: '', description: '' },
  day: dayAgents,
  night: nightAgents,
});

/** 只關心名字、不關心 textColor 時的簡寫 */
const named = (...names: string[]) => names.map((name) => ({ name, textColor: '' }));

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('extractAgentName', () => {
  it('應該回傳原始名稱（無括號）', () => {
    expect(extractAgentName('泠泠')).toBe('泠泠');
    expect(extractAgentName('Luna')).toBe('Luna');
  });

  it('應該提取括號前的名稱（代班情況）', () => {
    expect(extractAgentName('小楓(泠泠)')).toBe('小楓');
    expect(extractAgentName('音（Luna）')).toBe('音');
  });

  it('應該處理名稱前後有空格的情況', () => {
    expect(extractAgentName(' 泠泠 ')).toBe('泠泠');
    expect(extractAgentName('小楓 (泠泠)')).toBe('小楓');
  });
});

describe('findAgentByName', () => {
  it('應該根據名稱找到對應的探員', () => {
    const agent = findAgentByName('泠泠');
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('rin');
    expect(agent?.name).toBe('泠泠');
    expect(agent?.isFullTime).toBe(true);
  });

  it('應該以 emoji 找到對應的正職探員', () => {
    const agent = findAgentByName('🐷');
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('rin');
    expect(agent?.name).toBe('泠泠');
    expect(agent?.isFullTime).toBe(true);
  });

  it('應該以 emoji 找到米捲', () => {
    const agent = findAgentByName('🥨');
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('juano');
    expect(agent?.name).toBe('米捲');
  });

  it('應該以 emoji 找到 Luna', () => {
    const agent = findAgentByName('🌙');
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('luna');
    expect(agent?.name).toBe('Luna');
  });

  it('當找不到探員時應該回傳 null', () => {
    const agent = findAgentByName('不存在的探員');
    expect(agent).toBeNull();
  });
});

describe('getLastScheduleIso', () => {
  it('應該回傳最後一筆資料的 ISO 日期', () => {
    const schedules = [
      scheduleAt('2025-09-16'),
      scheduleAt('2025-10-01'),
      scheduleAt('2025-12-16'),
    ];

    expect(getLastScheduleIso(schedules)).toBe('2025-12-16');
  });

  it('空陣列應該回傳 null', () => {
    expect(getLastScheduleIso([])).toBeNull();
  });

  it('最後一筆沒有日期時應該回傳 null', () => {
    expect(getLastScheduleIso([scheduleAt('2025-12-16'), scheduleAt('')])).toBeNull();
  });
});

describe('resolveStatisticsEndIso', () => {
  it('資料已排到未來時，應以今天為視窗右端', () => {
    const schedules = [scheduleAt('2026-07-20'), scheduleAt('2026-08-31')];

    expect(resolveStatisticsEndIso(schedules, '2026-07-30')).toBe('2026-07-30');
  });

  it('資料尚未排到今天時，應以最後一筆為視窗右端', () => {
    const schedules = [scheduleAt('2026-05-01'), scheduleAt('2026-06-30')];

    expect(resolveStatisticsEndIso(schedules, '2026-07-30')).toBe('2026-06-30');
  });

  it('最後一筆剛好是今天時，右端為今天', () => {
    expect(resolveStatisticsEndIso([scheduleAt('2026-07-30')], '2026-07-30')).toBe('2026-07-30');
  });

  it('空資料時應回傳今天', () => {
    expect(resolveStatisticsEndIso([], '2026-07-30')).toBe('2026-07-30');
  });

  // 上面每一支都顯式傳 todayIso，但 `/api/statistics` 是靠預設值 `getTodayIso()`
  // 拿「今天」的。預設值的接線壞掉會通過上面全部測試，卻正好讓本次修掉的
  // 「未來排班被算成出勤」復發，故單獨釘住。
  it('不傳 todayIso 時應以真實的台北今天為準', () => {
    vi.setSystemTime(new Date('2026-07-30T12:00:00+08:00'));
    const schedules = [scheduleAt('2026-07-20'), scheduleAt('2026-08-31')];

    expect(resolveStatisticsEndIso(schedules)).toBe('2026-07-30');
  });

  // 台北已跨日、UTC 仍在前一天：預設值必須讀台北，不是機器時區
  it('台北 00:30 時，預設值應取台北的今天而非 UTC 的昨天', () => {
    vi.setSystemTime(new Date('2026-07-29T16:30:00Z')); // 台北 2026/07/30 00:30
    const schedules = [scheduleAt('2026-07-20'), scheduleAt('2026-08-31')];

    expect(resolveStatisticsEndIso(schedules)).toBe('2026-07-30');
  });
});

describe('filterRecentMonths', () => {
  it('應該回傳空陣列（當輸入為空）', () => {
    expect(filterRecentMonths([], 3)).toEqual([]);
  });

  it('應該篩選出近 N 個月的資料（指定參考日期）', () => {
    const schedules = [
      scheduleAt('2025-09-01'), // 超過 3 個月
      scheduleAt('2025-09-16'), // 剛好 3 個月（含邊界）
      scheduleAt('2025-10-01'),
      scheduleAt('2025-11-01'),
      scheduleAt('2025-12-16'),
    ];

    const result = filterRecentMonths(schedules, 3, '2025-12-16');

    expect(result.map((s) => s.date.iso)).toEqual([
      '2025-09-16',
      '2025-10-01',
      '2025-11-01',
      '2025-12-16',
    ]);
  });

  it('預設應該以資料最後一筆為參考日期', () => {
    const schedules = [
      scheduleAt('2025-09-01'),
      scheduleAt('2025-09-16'),
      scheduleAt('2025-10-01'),
      scheduleAt('2025-11-01'),
      scheduleAt('2025-12-16'), // 最後一筆
    ];

    const result = filterRecentMonths(schedules, 3);

    expect(result).toHaveLength(4);
    expect(result[0]?.date.iso).toBe('2025-09-16');
  });

  it('應該排除超過參考日期的資料', () => {
    const schedules = [
      scheduleAt('2025-09-16'),
      scheduleAt('2025-10-01'),
      scheduleAt('2025-12-10'),
      scheduleAt('2025-12-16'), // 超過參考日期
    ];

    const result = filterRecentMonths(schedules, 3, '2025-12-10');

    expect(result).toHaveLength(3);
    expect(result[result.length - 1]?.date.iso).toBe('2025-12-10');
  });

  it('應該正確處理跨年的情況', () => {
    const schedules = [
      scheduleAt('2024-10-01'), // 超過 3 個月
      scheduleAt('2024-11-15'), // 剛好 3 個月
      scheduleAt('2024-12-01'),
      scheduleAt('2025-01-01'),
      scheduleAt('2025-02-15'),
    ];

    const result = filterRecentMonths(schedules, 3, '2025-02-15');

    expect(result).toHaveLength(4);
    expect(result[0]?.date.iso).toBe('2024-11-15');
  });

  it('沒有日期的列（iso 為空）應被濾掉', () => {
    const schedules = [scheduleAt('2025-12-16'), scheduleAt('')];

    const result = filterRecentMonths(schedules, 3, '2025-12-16');

    expect(result).toHaveLength(1);
    expect(result[0]?.date.iso).toBe('2025-12-16');
  });

  it('參考日期不是合法 ISO 時應回傳空陣列，而非放行全部資料', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schedules = [scheduleAt('2025-12-16')];

    expect(filterRecentMonths(schedules, 3, '12月16日')).toEqual([]);
    // 全零的統計頁若連一行 log 都沒有，幾乎無法回推到這個分支
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe('calculateAgentStatistics', () => {
  it('應該回傳空陣列（當輸入為空）', () => {
    const result = calculateAgentStatistics([]);
    expect(result).toEqual([]);
  });

  it('應該正確統計各探員的班次', () => {
    const schedules = [
      scheduleAt('2025-12-01', named('泠泠', 'Luna'), named('米捲')),
      scheduleAt('2025-12-02', named('泠泠'), named('Luna', '米捲')),
      scheduleAt('2025-12-03', named('米捲'), named('泠泠')),
    ];

    const result = calculateAgentStatistics(schedules);

    const rin = result.find((s) => s.agentId === 'rin');
    expect(rin?.dayCount).toBe(2);
    expect(rin?.nightCount).toBe(1);
    expect(rin?.total).toBe(3);

    const luna = result.find((s) => s.agentId === 'luna');
    expect(luna?.dayCount).toBe(1);
    expect(luna?.nightCount).toBe(1);
    expect(luna?.total).toBe(2);

    const juano = result.find((s) => s.agentId === 'juano');
    expect(juano?.dayCount).toBe(1);
    expect(juano?.nightCount).toBe(2);
    expect(juano?.total).toBe(3);
  });

  it('應該按總班次降序排列', () => {
    const schedules = [
      scheduleAt('2025-12-01', named('泠泠', 'Luna'), named('米捲')),
      scheduleAt('2025-12-02', named('泠泠'), named('米捲')),
    ];

    const result = calculateAgentStatistics(schedules);

    expect(result[0]?.total).toBeGreaterThanOrEqual(result[1]?.total ?? 0);
  });

  it('總班次平手時應以日班數作為決定性 tie-breaker', () => {
    // 鑑別性設計：米捲先進 Map（插入序 [juano, rin]），但泠泠日班較多。
    // 泠泠 2 日 / 0 夜、米捲 1 日 / 1 夜 —— 同為 total 2。
    // 舊程式碼（只比 total）會維持插入序輸出 [juano, rin] 而 FAIL，
    // 唯有 tie-breaker 把日班多的泠泠提前才會 PASS。
    const schedules = [
      scheduleAt('2025-12-01', named('米捲', '泠泠')),
      scheduleAt('2025-12-02', named('泠泠'), named('米捲')),
    ];

    const result = calculateAgentStatistics(schedules);

    expect(result.map((s) => s.agentId)).toEqual(['rin', 'juano']);
  });

  it('應該處理代班名稱（括號情況）', () => {
    const schedules = [scheduleAt('2025-12-01', named('小楓(泠泠)'), named('音（Luna）'))];

    const result = calculateAgentStatistics(schedules);

    const mepuru = result.find((s) => s.agentId === 'mepuru');
    expect(mepuru?.dayCount).toBe(1);
    expect(mepuru?.total).toBe(1);

    const non = result.find((s) => s.agentId === 'non');
    expect(non?.nightCount).toBe(1);
    expect(non?.total).toBe(1);
  });

  it('應該忽略找不到對應的探員', () => {
    const schedules = [scheduleAt('2025-12-01', named('不存在的探員'), named('泠泠'))];

    const result = calculateAgentStatistics(schedules);

    expect(result.length).toBe(1);
    expect(result[0]?.agentId).toBe('rin');
  });

  // 灰字 textColor = 班表填寫者標記的「今日不出勤」(臨時請假),
  // 不能計入實際出勤統計,否則個人頁的不出勤標記會與「近 3 個月」班次數矛盾。
  describe('灰字 textColor「今日不出勤」應排除於統計外', () => {
    it('早班灰字探員不應被計入 dayCount', () => {
      const schedules = [
        scheduleAt('2025-12-01', [
          { name: '泠泠', textColor: '' },
          { name: '千熊', textColor: '#cccccc' }, // 灰字＝不出勤
        ]),
      ];

      const result = calculateAgentStatistics(schedules);

      const rin = result.find((s) => s.agentId === 'rin');
      expect(rin?.dayCount).toBe(1);

      // 千熊整天只有這一筆灰字班次,被排除後不應出現在統計中
      const senku = result.find((s) => s.agentId === 'senku');
      expect(senku).toBeUndefined();
    });

    it('晚班灰字探員不應被計入 nightCount', () => {
      const schedules = [
        scheduleAt(
          '2025-12-01',
          [],
          [
            { name: 'Luna', textColor: '#93c47d' }, // 綠晚班(正常出勤)
            { name: '千熊', textColor: '#999999' }, // 灰字＝不出勤
          ],
        ),
      ];

      const result = calculateAgentStatistics(schedules);

      const luna = result.find((s) => s.agentId === 'luna');
      expect(luna?.nightCount).toBe(1);

      const senku = result.find((s) => s.agentId === 'senku');
      expect(senku).toBeUndefined();
    });

    it('同探員多日交替(出勤 + 不出勤)只計出勤日', () => {
      const schedules = [
        scheduleAt('2025-12-01', [{ name: '泠泠', textColor: '' }]),
        scheduleAt('2025-12-02', [{ name: '泠泠', textColor: '#b7b7b7' }]),
        scheduleAt('2025-12-03', [{ name: '泠泠', textColor: '' }]),
      ];

      const result = calculateAgentStatistics(schedules);
      const rin = result.find((s) => s.agentId === 'rin');
      expect(rin?.dayCount).toBe(2);
      expect(rin?.total).toBe(2);
    });
  });
});

describe('getDateRange', () => {
  it('應該回傳實際資料的日期範圍', () => {
    const schedules = [
      scheduleAt('2025-09-16'),
      scheduleAt('2025-10-01'),
      scheduleAt('2025-11-01'),
      scheduleAt('2025-12-16'),
    ];

    const result = getDateRange(schedules);

    expect(result.from).toBe('9月16日');
    expect(result.to).toBe('12月16日');
  });

  it('應該正確處理跨年的情況', () => {
    const schedules = [
      scheduleAt('2024-11-15'),
      scheduleAt('2024-12-01'),
      scheduleAt('2025-01-01'),
      scheduleAt('2025-02-15'),
    ];

    const result = getDateRange(schedules);

    expect(result.from).toBe('11月15日');
    expect(result.to).toBe('2月15日');
  });

  it('空陣列應該回傳空字串', () => {
    const result = getDateRange([]);

    expect(result.from).toBe('');
    expect(result.to).toBe('');
  });

  it('應該處理單筆資料', () => {
    const result = getDateRange([scheduleAt('2025-12-16')]);

    expect(result.from).toBe('12月16日');
    expect(result.to).toBe('12月16日');
  });

  it('任一端沒有日期時兩端皆回空字串', () => {
    const result = getDateRange([scheduleAt(''), scheduleAt('2025-12-16')]);

    expect(result.from).toBe('');
    expect(result.to).toBe('');
  });
});

/**
 * 歷史班表 sheet 若累積超過 12 個月，同一個「1月5日」會出現兩次。只認月日的話
 * 兩筆會落在同一天上，一年前的班次因此被算進近三個月而靜默重複計算。
 */
describe('跨年重複標籤', () => {
  const schedules = [
    scheduleAt('2026-01-05', named('泠泠')),
    scheduleAt('2027-01-05', named('泠泠')),
  ];

  it('兩筆的顯示標籤相同，但 iso 可區分', () => {
    expect(schedules.map((s) => s.date.datetime)).toEqual(['1月5日', '1月5日']);
    expect(schedules.map((s) => s.date.iso)).toEqual(['2026-01-05', '2027-01-05']);
  });

  it('近三個月視窗只應納入當年那一筆', () => {
    const recent = filterRecentMonths(schedules, 3, '2027-01-10');

    expect(recent).toHaveLength(1);
    expect(recent[0]?.date.iso).toBe('2027-01-05');
  });

  it('統計不應重複計算一年前的同標籤班次', () => {
    const recent = filterRecentMonths(schedules, 3, '2027-01-10');
    const result = calculateAgentStatistics(recent);

    expect(result.find((s) => s.agentId === 'rin')?.total).toBe(1);
  });
});

/**
 * 當期班表會預先排到月底以後，若以「資料最後一筆」為視窗右端，「近三個月出勤
 * 統計」就會含進整整一個月的未來排班，與文案不符。
 */
describe('未來排班不計入出勤統計', () => {
  const TODAY_ISO = '2026-07-30';
  const schedules = [
    scheduleAt('2026-07-20', named('泠泠')), // 已發生
    scheduleAt('2026-07-30', named('泠泠')), // 今天
    scheduleAt('2026-08-15', named('泠泠')), // 未來
    scheduleAt('2026-08-31', named('泠泠')), // 未來（資料最後一筆）
  ];
  const recent = filterRecentMonths(
    schedules,
    3,
    resolveStatisticsEndIso(schedules, TODAY_ISO),
  );

  it('視窗只應納入今天與之前的班次', () => {
    expect(recent.map((s) => s.date.iso)).toEqual(['2026-07-20', '2026-07-30']);
  });

  it('統計次數不應含未來班次', () => {
    const result = calculateAgentStatistics(recent);

    expect(result.find((s) => s.agentId === 'rin')?.total).toBe(2);
  });

  it('dateRange.to 不應超過今天', () => {
    expect(getDateRange(recent).to).toBe('7月30日');
  });
});

describe('蜜柑 emoji 與文字名稱的統計整合', () => {
  // 建立含日期（早班）的原始 row：A 欄為 Excel 日期序號，C 欄為人員名稱
  const createDayRow = (dateSerial: number, agents: string): RowData => ({
    values: [
      { userEnteredValue: { numberValue: dateSerial } },
      {},
      { userEnteredValue: { stringValue: agents } },
    ],
  });

  it('應該將 🍊 與「蜜柑」的班次併入同一位探員', () => {
    // 蜜柑轉正職後的班次以 🍊 標示，轉正職前則為文字「蜜柑」
    const rows: RowData[] = [
      createDayRow(45292, '🍊'), // 轉正職後
      createDayRow(45293, '蜜柑'), // 轉正職前
    ];

    const schedules = transformSheetDataToSchedules(rows);
    const result = calculateAgentStatistics(schedules);

    expect(result.length).toBe(1);
    expect(result[0]?.agentId).toBe('mikan');
    expect(result[0]?.dayCount).toBe(2);
    expect(result[0]?.total).toBe(2);
    expect(result[0]?.isFullTime).toBe(true);
  });
});
