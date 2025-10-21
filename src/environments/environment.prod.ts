export const environment = {
  production: true,
  mode: 'csv' as 'csv' | 'api' | 'mock',
  csvUrl: 'https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=SHEET_GID',
  apiBaseUrl: 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec'
};
