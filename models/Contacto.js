import { query } from "../config/db.js";

export async function crearContacto(data) {
  const { rows } = await query(
    `INSERT INTO contactos (nombre, email, telefono, ciudad, asunto, mensaje)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.nombre,
      data.email,
      data.telefono || null,
      data.ciudad || null,
      data.asunto || null,
      data.mensaje,
    ],
  );
  return rows[0];
}

export async function listarContactos() {
  const { rows } = await query(
    "SELECT * FROM contactos ORDER BY creado_en DESC LIMIT 100",
  );
  return rows;
}