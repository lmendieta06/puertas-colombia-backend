import * as ComentarioModel from "../models/Comentario.js";
import transporter from "../config/mailer.js";
import { plantillaComentario } from "../views/notificaciones.template.js";

/**
 * GET /api/comentarios
 * Devuelve los comentarios aprobados, más nuevos primero.
 */
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
 * Body: { nombre, ciudad?, calificacion, mensaje }
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

    // Limita longitud para evitar abusos
    if (mensaje.length > 2000 || nombre.length > 120) {
      return res.status(400).json({ error: "Contenido demasiado largo" });
    }

    const comentario = await ComentarioModel.crearComentario({
      nombre,
      ciudad,
      calificacion: cal,
      mensaje,
    });

    // Notificar a la tienda en background
    transporter
      .sendMail({
        from: `"Puertas Colombia · Blog" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_TIENDA,
        subject: `Nuevo comentario en el blog (${cal}/5) — ${nombre}`,
        html: plantillaComentario(comentario),
      })
      .then(() =>
        console.log(`[comentarios] Notificación enviada (${nombre})`),
      )
      .catch((err) =>
        console.error("[comentarios] Error enviando notificación:", err.message),
      );

    return res.status(201).json({ ok: true, comentario });
  } catch (error) {
    console.error("[comentarios] Error:", error);
    return res
      .status(500)
      .json({ error: "Error al guardar el comentario", detalle: error.message });
  }
}