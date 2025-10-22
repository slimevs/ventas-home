export const environment = {
  production: false,
  mode: 'api' as 'csv' | 'api' | 'mock',
  // CSV: URL de exportación de Google Sheets (Formato CSV, público)
  // Ejemplo: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=SHEET_GID
  csvUrl: 'https://docs.google.com/spreadsheets/d/1JRpyhg_aXYyKfH6EKHtRBEJMXynfkVHTFSeMosa0CTs/export?format=csv&gid=1621820684',
  // API: URL del Web App de Google Apps Script publicado ("Cualquiera con el enlace")
  apiBaseUrl: 'https://script.google.com/macros/s/AKfycbwA6VVoqIWLPTI7y_SL7MvdylvsCN5D9rA4TRGqL-cnyHkb2SY11nkVAWA0DZOywQ_nMA/exec'
};
