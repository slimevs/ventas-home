export const environment = {
  production: false,
  mode: 'api' as 'csv' | 'api' | 'mock',
  // CSV: URL de exportación de Google Sheets (Formato CSV, público)
  // Ejemplo: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=SHEET_GID
  csvUrl: 'assets/ventas_ejemplo.csv',
  // API: URL del Web App de Google Apps Script publicado ("Cualquiera con el enlace")
  apiBaseUrl: '/api'
};
