# Comandos útiles - Gestor de Ventas

Requisitos: Node 18+, Angular CLI 17.

```bash
# Instalar dependencias
npm install

# Ejecutar en local (con proxy CORS)
npm run start

# (Opcional) Ejecutar en local sin proxy
npm run start:plain

# Build producción
npx ng build --configuration production --base-href "https://TU_USUARIO.github.io/ventas-home/"

# Deploy a GitHub Pages (requiere @angular/cli y angular-cli-ghpages)
npx ng deploy --base-href="https://TU_USUARIO.github.io/ventas-home/"
```

Configuración recomendada:
- `HashLocationStrategy` ya incluido mediante `withHashLocation()` en `src/main.ts`.
- Variables en `src/environments/*` para elegir el modo de datos y URLs.
- En dev `environment.ts` usa `apiBaseUrl: '/api'` (pasa por `proxy.conf.json`).
