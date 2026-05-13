import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("[db] Error inesperado en cliente idle:", err);
});

/**
 * Ejecuta una query parametrizada.
 * Uso: query("SELECT * FROM ventas WHERE id = $1", [id])
 */
export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[db] ${duration}ms — ${text.split("\n")[0].slice(0, 80)}`);
  }
  return result;
}

/**
 * Para usar transacciones: obtener un client y liberarlo después.
 */
export async function getClient() {
  return pool.connect();
}

export default pool;