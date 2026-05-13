import "dotenv/config";
import express from "express";
import cors from "cors";

import ventaRoutes from "./routes/ventaRoutes.js";
import contactoRoutes from "./routes/contactoRoutes.js";
import comentarioRoutes from "./routes/comentarioRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ============ CORS ============
// Acepta múltiples orígenes separados por coma en FRONTEND_URL.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Peticiones sin origin (curl, Postman, same-origin) se permiten.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado para origen: ${origin}`));
    },
    credentials: true,
  }),
);

// ============ MIDDLEWARES ============
app.use(express.json({ limit: "1mb" }));

// ============ HEALTHCHECK ============
app.get("/", (_req, res) => {
  res.json({
    name: "Puertas Colombia API",
    version: "1.0.0",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// ============ RUTAS ============
app.use("/api/ventas", ventaRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/comentarios", comentarioRoutes);

// ============ 404 Y ERRORES ============
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, _req, res, _next) => {
  console.error("[server] Error no capturado:", err);
  res
    .status(500)
    .json({ error: "Error interno del servidor", detalle: err.message });
});

// ============ ARRANQUE ============
import { query } from "./config/db.js";

async function ensureTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS ventas (
      id SERIAL PRIMARY KEY,
      numero_factura TEXT UNIQUE NOT NULL,
      fecha_emision DATE NOT NULL,
      fecha_vencimiento DATE NOT NULL,
      cliente_nombre TEXT NOT NULL,
      cliente_documento TEXT,
      cliente_email TEXT NOT NULL,
      cliente_telefono TEXT,
      cliente_ciudad TEXT,
      cliente_direccion TEXT,
      cliente_notas TEXT,
      metodo_pago TEXT NOT NULL,
      subtotal NUMERIC(12, 2) NOT NULL,
      iva NUMERIC(12, 2) NOT NULL,
      descuento NUMERIC(12, 2) DEFAULT 0,
      retencion NUMERIC(12, 2) NOT NULL,
      envio NUMERIC(12, 2) DEFAULT 0,
      total NUMERIC(12, 2) NOT NULL,
      creado_en TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS venta_items (
      id SERIAL PRIMARY KEY,
      venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
      producto_id TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario NUMERIC(12, 2) NOT NULL,
      total_linea NUMERIC(12, 2) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS contactos (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      telefono TEXT,
      ciudad TEXT,
      asunto TEXT,
      mensaje TEXT NOT NULL,
      creado_en TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS comentarios (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      ciudad TEXT,
      calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
      mensaje TEXT NOT NULL,
      aprobado BOOLEAN DEFAULT TRUE,
      creado_en TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("[db] Tablas verificadas/creadas");
}

ensureTables()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚪 Puertas Colombia API`);
      console.log(`   Escuchando en puerto: ${PORT}`);
      console.log(`   CORS permitido: ${allowedOrigins.join(", ")}`);
      console.log(`   Entorno: ${process.env.NODE_ENV || "development"}\n`);
    });
  })
  .catch((err) => {
    console.error("[server] ✗ No se pudo inicializar la DB:", err);
    process.exit(1);
  });