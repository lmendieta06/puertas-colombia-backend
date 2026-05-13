# Feature: Descargar factura en PDF

Reemplaza el envío por correo con un botón de descarga en la pantalla de
confirmación del pedido. Sin Nodemailer, sin Gmail API, sin SMTP.

## Archivos modificados

### Backend (carpeta backend/)

| Archivo destino | Archivo de origen |
|---|---|
| `package.json` | `backend/package.json` |
| `services/pdfService.js` (NUEVO) | `backend/pdfService.js` |
| `models/Venta.js` | `backend/Venta.js` |
| `controllers/ventaController.js` | `backend/ventaController.js` |
| `controllers/contactoController.js` | `backend/contactoController.js` |
| `controllers/comentarioController.js` | `backend/comentarioController.js` |
| `routes/ventaRoutes.js` | `backend/ventaRoutes.js` |

### Frontend

| Archivo destino | Archivo de origen |
|---|---|
| `src/services/ventaService.ts` | `frontend/ventaService.ts` |
| `src/routes/checkout.tsx` | `frontend/checkout.tsx` |

## Pasos de integración

### 1. Backend local

```bash
cd backend

# 1. Reemplazar archivos según la tabla de arriba

# 2. (Opcional) borrar archivos ya no usados
rm config/mailer.js
rm views/notificaciones.template.js

# 3. Instalar nuevas dependencias y quitar nodemailer
npm uninstall nodemailer
npm install puppeteer-core @sparticuz/chromium

# 4. Probar localmente
npm run dev
```

### 2. Probar el endpoint del PDF

Con el server corriendo y al menos una venta en la base de datos:

```bash
curl http://localhost:3001/api/ventas/FV-2026-0001/pdf --output factura.pdf
```

Si se descarga un PDF válido y se ve igual al diseño de la imagen modelo, ya está.

### 3. Frontend local

```bash
# Reemplaza:
#   src/services/ventaService.ts
#   src/routes/checkout.tsx

npm run dev
```

Hace una compra de prueba: en la pantalla de confirmación aparece el botón
"Descargar factura". Al darle clic descarga el PDF.

### 4. Subir a producción

```bash
# Backend
cd backend
git add .
git commit -m "feat: descargar factura PDF en lugar de enviar por correo"
git push

# Frontend
cd ../frontend
git add .
git commit -m "feat: botón descargar factura PDF"
git push
```

Railway y Vercel re-despliegan solos.

### 5. Variables de entorno en Railway

**Puedes BORRAR estas variables (ya no se usan):**

- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_TIENDA`

**Mantén las demás** (DATABASE_URL, EMPRESA_*, etc.)

## Cómo ver los mensajes de contacto y comentarios

Como ya no llegan por correo, los puedes revisar directamente en Supabase:

1. Entra a tu proyecto Supabase
2. **SQL Editor** → **New Query**
3. Pega:

```sql
-- Mensajes de contacto más recientes
SELECT nombre, email, telefono, ciudad, asunto, mensaje, creado_en
FROM contactos
ORDER BY creado_en DESC
LIMIT 50;

-- Comentarios del blog más recientes
SELECT nombre, ciudad, calificacion, mensaje, creado_en
FROM comentarios
ORDER BY creado_en DESC
LIMIT 50;

-- Ventas más recientes
SELECT numero_factura, cliente_nombre, cliente_email, total, creado_en
FROM ventas
ORDER BY creado_en DESC
LIMIT 50;
```

4. Run

También puedes ir a **Table Editor** y ver cada tabla con filtros visuales.

## Consideraciones de Puppeteer en Railway

La primera vez que un usuario descargue un PDF, Chromium se inicia y tarda
~3-5 segundos. Las siguientes descargas son instantáneas porque el browser
queda cacheado en memoria.

Si Railway reinicia el contenedor (deploy nuevo, sin tráfico por mucho tiempo),
la primera descarga vuelve a ser lenta. Es normal.