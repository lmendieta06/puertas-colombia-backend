import * as ComentarioModel from "../models/Comentario.js";

export async function listarComentarios(req, res) {
  try {
    const comentarios = await ComentarioModel.listarComentarios();
    return res.json({ ok: true, comentarios });
  } catch (error) {
    console.error("[comentarios] Error listando:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/comentarios
 * Guarda el comentario en la DB. Para verlos consultar Supabase.
 */
export async function crearComentario(req, res) {
  try {
    const { nombre, ciudad, calificacion, mensaje } = req.body;

    if (!nombre || !mensaje) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos (nombre, mensaje)" });
    }

    const cal = Number(calificacion);
    if (!Number.isInteger(cal) || cal < 1 || cal > 5) {
      return res
        .status(400)
        .json({ error: "La calificación debe ser un entero entre 1 y 5" });
    }

    if (mensaje.length > 2000 || nombre.length > 120) {
      return res.status(400).json({ error: "Contenido demasiado largo" });
    }

    const comentario = await ComentarioModel.crearComentario({
      nombre,
      ciudad,
      calificacion: cal,
      mensaje,
    });

    return res.status(201).json({ ok: true, comentario });
  } catch (error) {
    console.error("[comentarios] Error:", error);
    return res
      .status(500)
      .json({ error: "Error al guardar el comentario", detalle: error.message });
  }
}