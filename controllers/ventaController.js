import * as VentaModel from "../models/Venta.js";
import transporter from "../config/mailer.js";
import { plantillaFactura } from "../views/factura.template.js";

function getDatosEmpresa() {
  return {
    nombre: process.env.EMPRESA_NOMBRE,
    nit: process.env.EMPRESA_NIT,
    direccion: process.env.EMPRESA_DIRECCION,
    telefono: process.env.EMPRESA_TELEFONO,
    email: process.env.EMPRESA_EMAIL,
    regimen: process.env.EMPRESA_REGIMEN,
    resolucion_dian: process.env.EMPRESA_RESOLUCION_DIAN,
  };
}

/**
 * POST /api/ventas
 * Body esperado desde el frontend:
 * {
 *   cliente: { nombre, documento?, email, telefono, ciudad, direccion, notas? },
 *   items: [{ producto_id, descripcion, cantidad, precio_unitario }],
 *   metodo_pago: "pse" | "card" | "nequi" | ...,
 *   envio: number (opcional, por defecto 0)
 * }
 */
export async function crearVenta(req, res) {
  try {
    const { cliente, items, metodo_pago, envio = 0 } = req.body;

    // ============ VALIDACIÓN ============
    if (!cliente || !cliente.nombre || !cliente.email) {
      return res
        .status(400)
        .json({ error: "Faltan datos del cliente (nombre, email)" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }
    if (!metodo_pago) {
      return res.status(400).json({ error: "Falta el método de pago" });
    }

    for (const item of items) {
      if (
        !item.producto_id ||
        !item.descripcion ||
        !Number.isInteger(item.cantidad) ||
        item.cantidad <= 0 ||
        typeof item.precio_unitario !== "number" ||
        item.precio_unitario < 0
      ) {
        return res.status(400).json({
          error: "Item inválido en el carrito",
          item,
        });
      }
    }

    // ============ CÁLCULOS FISCALES ============
    const ivaPct = Number(process.env.IVA_PORCENTAJE || 19) / 100;
    const retPct = Number(process.env.RETENCION_PORCENTAJE || 3.5) / 100;

    const itemsConTotal = items.map((it) => ({
      ...it,
      total_linea: it.cantidad * it.precio_unitario,
    }));

    const subtotal = itemsConTotal.reduce((s, i) => s + i.total_linea, 0);
    const iva = Math.round(subtotal * ivaPct);
    const descuento = 0;
    const retencion = Math.round(subtotal * retPct);
    const total = subtotal + iva - descuento - retencion + Number(envio);

    // ============ NÚMERO DE FACTURA Y FECHAS ============
    const numeroFactura = await VentaModel.generarNumeroFactura();
    const hoy = new Date();
    const vencimiento = new Date(hoy);
    vencimiento.setDate(vencimiento.getDate() + 30);

    const ventaData = {
      numero_factura: numeroFactura,
      fecha_emision: hoy.toISOString().slice(0, 10),
      fecha_vencimiento: vencimiento.toISOString().slice(0, 10),

      cliente_nombre: cliente.nombre,
      cliente_documento: cliente.documento || null,
      cliente_email: cliente.email,
      cliente_telefono: cliente.telefono || null,
      cliente_ciudad: cliente.ciudad || null,
      cliente_direccion: cliente.direccion || null,
      cliente_notas: cliente.notas || null,

      metodo_pago,
      subtotal,
      iva,
      descuento,
      retencion,
      envio,
      total,
    };

    // ============ GUARDAR EN DB ============
    const venta = await VentaModel.crearVenta(ventaData, itemsConTotal);

    // ============ ENVIAR CORREO CON FACTURA ============
    const empresa = getDatosEmpresa();
    const html = plantillaFactura(venta, empresa);

    // Envío en background: no bloquea la respuesta si Gmail tarda
    transporter
      .sendMail({
        from: `"${empresa.nombre}" <${process.env.MAIL_USER}>`,
        to: venta.cliente_email,
        bcc: process.env.MAIL_TIENDA,
        subject: `Factura ${venta.numero_factura} — Puertas Colombia`,
        html,
      })
      .then(() => {
        console.log(`[ventas] Factura ${venta.numero_factura} enviada a ${venta.cliente_email}`);
      })
      .catch((err) => {
        console.error(`[ventas] Error enviando factura ${venta.numero_factura}:`, err.message);
      });

    return res.status(201).json({
      ok: true,
      venta: {
        id: venta.id,
        numero_factura: venta.numero_factura,
        total: venta.total,
        cliente_email: venta.cliente_email,
      },
    });
  } catch (error) {
    console.error("[ventas] Error:", error);
    return res
      .status(500)
      .json({ error: "Error al procesar la venta", detalle: error.message });
  }
}

export async function listarVentas(req, res) {
  try {
    const ventas = await VentaModel.listarVentas();
    return res.json({ ok: true, ventas });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function obtenerVenta(req, res) {
  try {
    const venta = await VentaModel.obtenerVentaPorId(req.params.id);
    if (!venta) return res.status(404).json({ error: "Venta no encontrada" });
    return res.json({ ok: true, venta });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}