# Majinboot

Majinboot es una aplicación de escritorio construida con **Electron**, **React + Vite**, **TailwindCSS** y **Framer Motion** que permite administrar múltiples bots de WhatsApp basados en `whatsapp-web.js`. Incluye un backend en Express, persistencia local por sesión y una interfaz glassmorphism inspirada en iOS 18.

## Requisitos previos
- Node.js 18 o superior
- npm 9+

## Instalación
```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

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
