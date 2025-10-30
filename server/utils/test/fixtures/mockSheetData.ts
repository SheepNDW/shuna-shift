import type { RowData } from '~~/shared/types';

/**
 * 模擬 Google Sheets API 回傳的原始資料
 * 包含兩天的班表資料（早班和晚班）
 */
export const mockSheetData: RowData[] = [
  {
    values: [
      {
        userEnteredValue: {
          numberValue: 45952,
        },
      },
      {
        userEnteredValue: {
          stringValue: '早',
        },
      },
      {
        userEnteredValue: {
          stringValue: '🌙、🥨、凜奈、亞米',
        },
      },
    ],
  },
  {
    values: [
      {},
      {
        userEnteredValue: {
          stringValue: '晚',
        },
      },
      {
        userEnteredValue: {
          stringValue: '🌙、🥨、小楓、紅、子子',
        },
      },
    ],
  },
  {
    values: [
      {
        userEnteredValue: {
          numberValue: 45953,
        },
      },
      {
        userEnteredValue: {
          stringValue: '早',
        },
      },
      {
        userEnteredValue: {
          stringValue: '🐷、🥨、千熊、凜奈、景子',
        },
      },
    ],
  },
  {
    values: [
      {},
      {
        userEnteredValue: {
          stringValue: '晚',
        },
      },
      {
        userEnteredValue: {
          stringValue: '🐷、🥨、井野、亞米、棠棠',
        },
      },
    ],
  },
  {
    values: [
      {
        userEnteredValue: {
          numberValue: 45954,
        },
      },
      {
        userEnteredValue: {
          stringValue: '早',
        },
      },
      {
        userEnteredValue: {
          stringValue: '🐷、🥨、芽、小楓、璐奈',
        },
      },
    ],
  },
  {
    values: [
      {},
      {
        userEnteredValue: {
          stringValue: '晚',
        },
      },
      {
        userEnteredValue: {
          stringValue: '🐷、🥨、七尾、三里、亞米(和実)、棠棠',
        },
        textFormatRuns: [
          {
            startIndex: 12,
            format: {
              foregroundColor: {
                red: 1,
              },
              foregroundColorStyle: {
                rgbColor: {
                  red: 1,
                },
              },
            },
          },
          {
            startIndex: 14,
            format: {},
          },
          {
            startIndex: 15,
            format: {
              foregroundColor: {
                red: 0.6,
                green: 0.6,
                blue: 0.6,
              },
              foregroundColorStyle: {
                rgbColor: {
                  red: 0.6,
                  green: 0.6,
                  blue: 0.6,
                },
              },
            },
          },
          {
            startIndex: 17,
            format: {},
          },
        ],
      },
    ],
  },
  {
    values: [
      {
        userEnteredValue: {
          numberValue: 45955,
        },
        userEnteredFormat: {
          backgroundColor: {
            red: 0.6,
            green: 0.6,
            blue: 0.6,
          },
        },
      },
      {
        userEnteredValue: {
          stringValue: '早',
        },
        userEnteredFormat: {
          backgroundColor: {
            red: 0.6,
            green: 0.6,
            blue: 0.6,
          },
        },
      },
      {
        userEnteredFormat: {
          backgroundColor: {
            red: 0.6,
            green: 0.6,
            blue: 0.6,
          },
        },
      },
    ],
  },
  {
    values: [
      {
        userEnteredFormat: {
          backgroundColor: {
            red: 0.6,
            green: 0.6,
            blue: 0.6,
          },
        },
      },
      {
        userEnteredValue: {
          stringValue: '晚',
        },
        userEnteredFormat: {
          backgroundColor: {
            red: 0.6,
            green: 0.6,
            blue: 0.6,
          },
        },
      },
      {
        userEnteredFormat: {
          backgroundColor: {
            red: 0.6,
            green: 0.6,
            blue: 0.6,
          },
        },
      },
    ],
  },
];

/**
 * 模擬換月的資料
 */
export const mockSheetDataNewMonth: RowData[] = [
  {
    values: [
      {
        userEnteredValue: {
          numberValue: 45961,
        },
        userEnteredFormat: {
          backgroundColor: {
            red: 0.7137255,
            green: 0.84313726,
            blue: 0.65882355,
          },
        },
      },
      {
        userEnteredValue: {
          stringValue: '早',
        },
      },
      {
        userEnteredValue: {
          stringValue: '🌙、🥨、千熊、梂、三里、景子',
        },
      },
    ],
  },
  {
    values: [
      {
        userEnteredValue: {
          stringValue: '萬聖',
        },
        userEnteredFormat: {
          backgroundColor: {
            red: 0.7137255,
            green: 0.84313726,
            blue: 0.65882355,
          },
        },
      },
      {
        userEnteredValue: {
          stringValue: '晚',
        },
      },
      {
        userEnteredValue: {
          stringValue: '🌙、🥨、百夜、芽、亞米、棠棠',
        },
      },
    ],
  },
  {
    values: [
      {
        userEnteredValue: {
          stringValue: '11月',
        },
      },
    ],
  },
];
