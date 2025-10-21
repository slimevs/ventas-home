export const environment = {
  production: true,
  mode: 'api' as 'csv' | 'api' | 'mock',
  csvUrl: 'https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=SHEET_GID',
  apiBaseUrl: 'https://script.google.com/macros/s/AKfycbxtlEWCssyXZ0RC-n5A_zAeTjVo_iqwzn44rY0CiMjAPfMWBKhTSqzosvlL1DSnpZHv/exec'
};
