import type { ShiftSchedule } from '~~/shared/types';

/**
 * transformSheetDataToSchedules 函式的預期輸出資料
 * 對應 mockSheetData 轉換後的結果
 */
export const expectedScheduleData: ShiftSchedule[] = [
  {
    date: {
      iso: '2025-10-22',
      datetime: '10月22日',
      backgroundColor: '',
      description: '',
    },
    day: [
      {
        name: 'Luna',
        textColor: '',
      },
      {
        name: '米捲',
        textColor: '',
      },
      {
        name: '凜奈',
        textColor: '',
      },
      {
        name: '亞米',
        textColor: '',
      },
    ],
    night: [
      {
        name: 'Luna',
        textColor: '',
      },
      {
        name: '米捲',
        textColor: '',
      },
      {
        name: '小楓',
        textColor: '',
      },
      {
        name: '紅',
        textColor: '',
      },
      {
        name: '子子',
        textColor: '',
      },
    ],
  },
  {
    date: {
      iso: '2025-10-23',
      datetime: '10月23日',
      backgroundColor: '',
      description: '',
    },
    day: [
      {
        name: '泠泠',
        textColor: '',
      },
      {
        name: '米捲',
        textColor: '',
      },
      {
        name: '千熊',
        textColor: '',
      },
      {
        name: '凜奈',
        textColor: '',
      },
      {
        name: '景子',
        textColor: '',
      },
    ],
    night: [
      {
        name: '泠泠',
        textColor: '',
      },
      {
        name: '米捲',
        textColor: '',
      },
      {
        name: '井野',
        textColor: '',
      },
      {
        name: '亞米',
        textColor: '',
      },
      {
        name: '棠棠',
        textColor: '',
      },
    ],
  },
  {
    date: {
      iso: '2025-10-24',
      datetime: '10月24日',
      backgroundColor: '',
      description: '',
    },
    day: [
      {
        name: '泠泠',
        textColor: '',
      },
      {
        name: '米捲',
        textColor: '',
      },
      {
        name: '芽',
        textColor: '',
      },
      {
        name: '小楓',
        textColor: '',
      },
      {
        name: '璐奈',
        textColor: '',
      },
    ],
    night: [
      {
        name: '泠泠',
        textColor: '',
      },
      {
        name: '米捲',
        textColor: '',
      },
      {
        name: '七尾',
        textColor: '',
      },
      {
        name: '三里',
        textColor: '',
      },
      {
        name: '亞米(和実)',
        textColor: '#ff0000',
      },
      {
        name: '棠棠',
        textColor: '',
      },
    ],
  },
  {
    date: {
      iso: '2025-10-25',
      datetime: '10月25日',
      backgroundColor: '#999999',
      description: '',
    },
    day: [],
    night: [],
  },
];

/**
 * 對應 mockSheetDataNewMonth 轉換後的結果
 */
export const expectedScheduleDataNewMonth: ShiftSchedule[] = [
  {
    date: {
      iso: '2025-10-31',
      datetime: '10月31日',
      backgroundColor: '#b6d7a8',
      description: '一日限定・萬聖',
    },
    day: [
      {
        name: 'Luna',
        textColor: '',
      },
      {
        name: '米捲',
        textColor: '',
      },
      {
        name: '千熊',
        textColor: '',
      },
      {
        name: '梂',
        textColor: '',
      },
      {
        name: '三里',
        textColor: '',
      },
      {
        name: '景子',
        textColor: '',
      },
    ],
    night: [
      {
        name: 'Luna',
        textColor: '',
      },
      {
        name: '米捲',
        textColor: '',
      },
      {
        name: '百夜',
        textColor: '',
      },
      {
        name: '芽',
        textColor: '',
      },
      {
        name: '亞米',
        textColor: '',
      },
      {
        name: '棠棠',
        textColor: '',
      },
    ],
  },
];
