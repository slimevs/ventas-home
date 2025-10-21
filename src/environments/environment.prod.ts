export const environment = {
  production: true,
  mode: 'api' as 'csv' | 'api' | 'mock',
  csvUrl: 'https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=SHEET_GID',
  apiBaseUrl: 'https://script.google.com/macros/s/AKfycbwDNoBzEbxH74tJfQ481t4_EIE5Yroio7W5hDJl0yX_kK7PotodSmx6eNwc4_VcyaMe/exec'
};
