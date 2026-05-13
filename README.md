# Puertas Colombia — Backend

Backend MVC en Node.js + Express + PostgreSQL para:

- Registrar **ventas** y enviar la factura por correo (HTML, estilo igual al modelo)
- Guardar mensajes del formulario **Contáctanos** y reenviarlos al correo de la tienda
- Guardar **comentarios del blog** en la base de datos y notificarlos por correo

## Estructura

```
backend/
├── config/
│   ├── db.js              # Pool de PostgreSQL
│   └── mailer.js          # Nodemailer + Gmail
├── controllers/
│   ├── ventaController.js
│   ├── contactoController.js
│   └── comentarioController.js
├── models/
│   ├── Venta.js
│   ├── Contacto.js
│   └── Comentario.js
├── routes/
│   ├── ventaRoutes.js
│   ├── contactoRoutes.js
│   └── comentarioRoutes.js
├── views/                 # Plantillas HTML para correos
│   ├── factura.template.js
│   └── notificaciones.template.js
├── scripts/
│   └── init-db.js         # Crea las tablas
├── server.js              # Punto de entrada
├── package.json
├── Dockerfile
├── railway.json
└── .env.example
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/ventas` | Crea venta, calcula impuestos, guarda y envía factura por correo |
| `GET`  | `/api/ventas` | Lista las últimas 100 ventas (admin) |
| `GET`  | `/api/ventas/:id` | Detalle con items |
| `POST` | `/api/contacto` | Guarda mensaje y notifica a la tienda |
| `GET`  | `/api/contacto` | Lista mensajes recibidos (admin) |
| `GET`  | `/api/comentarios` | Lista comentarios aprobados |
| `POST` | `/api/comentarios` | Crea comentario y notifica por correo |

---

## Local

### 1. Requisitos

- Node 20+
- Un Postgres corriendo. La forma más fácil con Docker:

```bash
docker run -d --name puertas-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=puertas_colombia \
  -p 5432:5432 \
  postgres:16
```

### 2. Configuración

```bash
cd backend
cp .env.example .env
# Edita .env con tu MAIL_PASS de Gmail (App Password)
npm install
```

### 3. Crear tablas y arrancar

```bash
npm run db:init   # Crea las tablas
npm run dev       # Arranca con --watch (recarga automática)
```

Abre <http://localhost:3001/> para ver el healthcheck.

### 4. Probar con curl

```bash
# Crear venta de prueba
curl -X POST http://localhost:3001/api/ventas \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": {
      "nombre": "Valentina Sanabria",
      "documento": "901.234.567-1",
      "email": "tu-correo@ejemplo.com",
      "telefono": "(+57) 4 789 0123",
      "ciudad": "Bogotá",
      "direccion": "Carrera 50 # 25-10"
    },
    "items": [
      { "producto_id": "mompox-102", "descripcion": "Mompox", "cantidad": 1, "precio_unitario": 890000 }
    ],
    "metodo_pago": "transfer"
  }'
```

---

## Gmail: App Password

1. Activa verificación en 2 pasos: <https://myaccount.google.com/security>
2. Crea una App Password: <https://myaccount.google.com/apppasswords>
3. Pega los 16 caracteres en `MAIL_PASS` (sin espacios)

> ⚠️ **NUNCA** uses la contraseña normal de Gmail. Google la rechaza desde 2022.

---

## Deploy a Railway

### Paso 1 — Crear el proyecto

1. Entra a [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo**
2. Selecciona el repositorio que contiene esta carpeta `backend/`
3. Railway detecta automáticamente Node (vía Nixpacks) y `railway.json`

### Paso 2 — Añadir PostgreSQL

1. En tu proyecto Railway → **+ New** → **Database** → **Add PostgreSQL**
2. Railway crea automáticamente la variable `DATABASE_URL` y la inyecta en tu servicio.

### Paso 3 — Variables de entorno

En la pestaña **Variables** del servicio, agrega (deja `DATABASE_URL` como está, Railway la maneja):

```
DATABASE_SSL=true
FRONTEND_URL=https://tudominio.com
MAIL_USER=puertascolombianas@gmail.com
MAIL_PASS=tu_app_password_de_16_caracteres
MAIL_TIENDA=puertascolombianas@gmail.com
EMPRESA_NOMBRE=PUERTAS COLOMBIANAS
EMPRESA_NIT=900.123.456-7
EMPRESA_DIRECCION=Parque de la 93, Bogotá D.C., Colombia
EMPRESA_TELEFONO=(+57) 321 613 6824
EMPRESA_EMAIL=puertascolombianas@gmail.com
EMPRESA_REGIMEN=Régimen Común | Responsable de IVA
EMPRESA_RESOLUCION_DIAN=18764030960282
IVA_PORCENTAJE=19
RETENCION_PORCENTAJE=3.5
NODE_ENV=production
```

### Paso 4 — Deploy

Railway lo despliega solo en cada push. El comando `node scripts/init-db.js && node server.js` (configurado en `railway.json`) crea las tablas la primera vez y arranca el servidor.

### Paso 5 — Dominio público

En el servicio → **Settings** → **Networking** → **Generate Domain**. Tendrás algo como `https://puertas-colombia-backend.up.railway.app`.

Usa esa URL en el frontend (variable `VITE_API_URL`).

---

## Conectar el frontend

En tu proyecto de React (TanStack), crea `src/lib/api.ts`:

```ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Error ${res.status}`);
  }
  return res.json();
}

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}
```

Variable en `.env.local` del frontend:

```
VITE_API_URL=http://localhost:3001
```

Y en producción:

```
VITE_API_URL=https://puertas-colombia-backend.up.railway.app
```