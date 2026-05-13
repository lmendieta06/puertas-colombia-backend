import * as ContactoModel from "../models/Contacto.js";

/**
 * POST /api/contacto
 * Guarda el mensaje en la DB. Para verlo, consulta Supabase.
 */
export async function crearContacto(req, res) {
  try {
    const { nombre, email, telefono, ciudad, asunto, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos (nombre, email, mensaje)" });
    }

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