import * as ContactoModel from "../models/Contacto.js";
import transporter from "../config/mailer.js";
import { plantillaContacto } from "../views/notificaciones.template.js";

/**
 * POST /api/contacto
 * Body: { nombre, email, telefono?, ciudad?, asunto?, mensaje }
 */
export async function crearContacto(req, res) {
  try {
    const { nombre, email, telefono, ciudad, asunto, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos (nombre, email, mensaje)" });
    }

    // Validación simple de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Correo electrónico inválido" });
    }

    const contacto = await ContactoModel.crearContacto({
      nombre,
      email,
      telefono,
      ciudad,
      asunto,
      mensaje,
    });

    // Enviar notificación a la tienda en background
    transporter
      .sendMail({
        from: `"Puertas Colombia · Contacto" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_TIENDA,
        replyTo: email,
        subject: `Nuevo contacto: ${asunto || nombre}`,
        html: plantillaContacto(contacto),
      })
      .then(() => console.log(`[contacto] Notificación enviada (${email})`))
      .catch((err) =>
        console.error("[contacto] Error enviando notificación:", err.message),
      );

    return res.status(201).json({ ok: true, contacto: { id: contacto.id } });
  } catch (error) {
    console.error("[contacto] Error:", error);
    return res
      .status(500)
      .json({ error: "Error al guardar el contacto", detalle: error.message });
  }
}

export async function listarContactos(req, res) {
  try {
    const contactos = await ContactoModel.listarContactos();
    return res.json({ ok: true, contactos });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}