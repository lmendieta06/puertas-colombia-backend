import { query } from "../config/db.js";

export async function crearComentario(data) {
  const { rows } = await query(
    `INSERT INTO comentarios (nombre, ciudad, calificacion, mensaje)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      data.nombre,
      data.ciudad || "Colombia",
      data.calificacion,
      data.mensaje,
    ],
  );
  return rows[0];
}

export async function listarComentarios({ soloAprobados = true } = {}) {
  const sql = soloAprobados
    ? "SELECT * FROM comentarios WHERE aprobado = TRUE ORDER BY creado_en DESC LIMIT 100"
    : "SELECT * FROM comentarios ORDER BY creado_en DESC LIMIT 100";
  const { rows } = await query(sql);
  return rows;
}