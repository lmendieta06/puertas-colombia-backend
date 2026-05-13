import "dotenv/config";
import { query } from "../config/db.js";

const sql = `
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

  CREATE INDEX IF NOT EXISTS idx_ventas_email ON ventas(cliente_email);
  CREATE INDEX IF NOT EXISTS idx_ventas_creado ON ventas(creado_en DESC);
  CREATE INDEX IF NOT EXISTS idx_comentarios_creado ON comentarios(creado_en DESC);
`;

async function main() {
  try {
    console.log("[init-db] Creando tablas en Postgres...");
    await query(sql);
    console.log("[init-db] ✓ Tablas creadas correctamente");
    process.exit(0);
  } catch (error) {
    console.error("[init-db] ✗ Error:", error.message);
    process.exit(1);
  }
}

main();