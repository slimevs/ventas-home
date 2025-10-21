# Gestor de Ventas (Angular + Google Sheets)

Aplicación web en Angular para gestionar ventas, inventario y clientes, conectada a Google Sheets mediante Google Apps Script.  
Incluye modo CSV (solo lectura) y modo API (CRUD completo).

---

## Enlaces rápidos
- App en GitHub Pages: https://TU_USUARIO.github.io/ventas-home/
- Repositorio: https://github.com/TU_USUARIO/ventas-home
- Comandos de referencia: `Comandos_Angular_Gestor_Ventas.md`

Reemplaza `TU_USUARIO` por tu usuario real y ajusta el slug si tu repositorio no es `ventas-home`.

---

## Stack principal
- Frontend: Angular 17+, SCSS
- Backend: Google Apps Script (Web App)
- Datos: Google Sheets (modo CSV o API)
- Gráficos: Chart.js + ng2-charts (opcional)

---

## Funcionalidades
- Registro de ventas (agregar, editar, eliminar)
- Inventario sincronizado con precios y costos
- Cálculo automático de ganancias y totales
- KPIs de rendimiento (ventas, ticket promedio, etc.)
- Dashboard con filtros por fecha, producto y estado
- Responsive (móvil y escritorio)

---

## Instalación local
```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/ventas-home.git
cd ventas-home

# Instalar dependencias
npm install

# Ejecutar en local (modo mock por defecto)
npx ng serve -o
```

---

## Configuración de datos (CSV o API)

Edita los archivos de entorno:
- Desarrollo: `src/environments/environment.ts`
- Producción: `src/environments/environment.prod.ts`

Modos disponibles: `mock` | `csv` | `api`.

Ejemplo CSV (solo lectura):
```
mode: 'csv'
csvUrl: "https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=SHEET_GID"
```

Cómo obtener la URL CSV:
1) Abre tu Google Sheet  
2) Archivo → Compartir → “Cualquiera con el enlace” (lector)  
3) Usa la URL de exportación con `format=csv` y el `gid` de la pestaña

Ejemplo API (CRUD completo):
```
mode: 'api'
apiBaseUrl: "https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
```

Cómo publicar el Web App de Apps Script:
1) Copia `backend/google-apps-script/Code.gs` en script.google.com  
2) Reemplaza `SHEET_ID` con el ID de tu hoja  
3) Implementar → Nueva implementación → Tipo “Aplicación web”  
4) Acceso: “Cualquiera con el enlace” → Guardar  
5) Copia la URL y pégala en `apiBaseUrl`

---

## Despliegue en GitHub Pages
```bash
# Compilar para producción
npx ng build --configuration production --base-href "https://TU_USUARIO.github.io/ventas-home/"

# Deploy directo (requiere ng deploy configurado)
npx ng deploy --base-href="https://TU_USUARIO.github.io/ventas-home/"
```

O mediante GitHub Actions usando `.github/workflows/gh-pages.yml`.

Notas:
- Se usa HashLocationStrategy para evitar 404 en GitHub Pages.
- Ajusta el `base-href` al slug real del repositorio.

---

## Autor
Jesús Moreno  
Desarrollado en Angular + Google Sheets

