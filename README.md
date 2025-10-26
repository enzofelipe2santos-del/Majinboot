# Majinboot

Majinboot es una aplicación de escritorio construida con **Electron**, **React + Vite**, **TailwindCSS** y **Framer Motion** que permite administrar múltiples bots de WhatsApp basados en `whatsapp-web.js`. Incluye un backend en Express, persistencia local por sesión y una interfaz glassmorphism inspirada en iOS 18.

## Requisitos previos
- Node.js 18 o superior
- npm 9+

## Instalación
```bash
npm install
```

Durante la instalación principal se ejecutará automáticamente la descarga de las dependencias del backend y del frontend
(gracias al script `postinstall`). Si prefieres hacerlo manualmente o si interrumpes el proceso, puedes ejecutar:

```bash
npm install --prefix backend
npm install --prefix frontend
```

> **Nota para Windows:** asegúrate de incluir el espacio antes de `--prefix`. El comando correcto es `npm install --prefix frontend`
> (con espacio). Si omites ese espacio, `npm` intentará ejecutar un comando inexistente y no instalará Vite ni el resto de
> dependencias del frontend, provocando errores como `Cannot find package 'vite'` cuando corras `npm run dev`.

### Si ya viste el error `Cannot find package 'vite'`
1. Vuelve a la raíz del proyecto (`Majinboot/`).
2. Ejecuta nuevamente la instalación asegurándote de escribir el espacio en el comando:
   ```bash
   npm install --prefix frontend
   ```
3. Comprueba que se haya creado la carpeta `frontend/node_modules`. Si el comando vuelve a fallar, elimina la carpeta temporal
   que crea Vite y repite la instalación:
   ```bash
   rmdir /s /q frontend\\node_modules\\.vite-temp  # En PowerShell
   npm install --prefix frontend
   ```
4. Una vez instaladas las dependencias, corre `npm run dev` desde la raíz. Si seguía abierto el proceso anterior, deténlo con
   `Ctrl + C` antes de lanzar el comando.

## Desarrollo
```bash
npm run dev
```

Este comando levanta simultáneamente:
- Backend Express en `http://localhost:4010`
- Frontend Vite en `http://localhost:5173`
- Shell de Electron apuntando al frontend

## Estructura
```
Majinboot/
├── backend/               # API REST, controladores y servicios de bots
├── config/                # Ajustes compartidos
├── database/              # Base de datos SQLite y backups
├── frontend/              # Interfaz React + Tailwind + Framer Motion
├── sessions/              # Directorio raíz para sesiones de WhatsApp
├── main.js                # Entrada de Electron
├── preload.js             # Context bridge
└── README.md
```

## Funcionalidades destacadas
- Gestión de sesiones con autenticación QR usando `whatsapp-web.js`
- Configuración independiente por sesión (`/sessions/<id>/config.json`)
- Triggers con coincidencia exacta o difusa y respuestas multimedia reordenables
- Recordatorios automáticos y cancelación inteligente por interacción
- Consola visual de logs en tiempo real y notificaciones del sistema
- Dashboard con métricas básicas y gráficos (Recharts)
- Preparado para backups automáticos y analítica persistente

## Scripts útiles
- `npm run build` – Compila el frontend para producción.
- `npm run lint` – Ejecuta ESLint en el frontend.
- `npm run dev --prefix backend` – Ejecuta solo el backend.
- `npm run dev --prefix frontend` – Ejecuta solo el frontend.

## Notas
- Los archivos multimedia utilizados por los triggers deben mantenerse en rutas accesibles; la aplicación verifica su existencia antes de enviarlos.
- Para empaquetar la aplicación se pueden añadir herramientas como `electron-builder` en el futuro.
- El directorio `sessions/` queda fuera del control de versiones para proteger credenciales locales.
