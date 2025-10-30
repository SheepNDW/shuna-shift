import type { ShiftSchedule } from '~~/shared/types';

/**
 * transformSheetDataToSchedules 函式的預期輸出資料
 * 對應 mockSheetData 轉換後的結果
 */
export const expectedScheduleData: ShiftSchedule[] = [
  {
    date: {
      datetime: '10月22日',
      backgroundColor: '',
      description: '',
    },
    day: [
      {
        name: '🌙',
        textColor: '',
      },
      {
        name: '🥨',
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
        name: '🌙',
        textColor: '',
      },
      {
        name: '🥨',
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
      datetime: '10月23日',
      backgroundColor: '',
      description: '',
    },
    day: [
      {
        name: '🐷',
        textColor: '',
      },
      {
        name: '🥨',
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
        name: '🐷',
        textColor: '',
      },
      {
        name: '🥨',
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
      datetime: '10月24日',
      backgroundColor: '',
      description: '',
    },
    day: [
      {
        name: '🐷',
        textColor: '',
      },
      {
        name: '🥨',
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
        name: '🐷',
        textColor: '',
      },
      {
        name: '🥨',
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
      datetime: '10月31日',
      backgroundColor: '#b6d7a8',
      description: '萬聖',
    },
    day: [
      {
        name: '🌙',
        textColor: '',
      },
      {
        name: '🥨',
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
        name: '🌙',
        textColor: '',
      },
      {
        name: '🥨',
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
