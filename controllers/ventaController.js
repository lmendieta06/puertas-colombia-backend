import * as VentaModel from "../models/Venta.js";
import { plantillaFactura } from "../views/factura.template.js";
import { htmlToPdf } from "../services/pdfService.js";

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
 * Crea la venta y la guarda en la DB. NO envía correo.
 * El cliente descargará la factura desde el frontend.
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

    const venta = await VentaModel.crearVenta(ventaData, itemsConTotal);

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

/**
 * GET /api/ventas/:numeroFactura/pdf
 * Genera y descarga el PDF de la factura.
 * Acepta el número de factura (FV-2026-NNNN) o el id numérico.
 */
export async function descargarFacturaPDF(req, res) {
  try {
    const { numeroFactura } = req.params;

    const venta = /^\d+$/.test(numeroFactura)
      ? await VentaModel.obtenerVentaPorId(Number(numeroFactura))
      : await VentaModel.obtenerVentaPorNumero(numeroFactura);

    if (!venta) {
      return res.status(404).json({ error: "Factura no encontrada" });
    }

    const empresa = getDatosEmpresa();
    const html = plantillaFactura(venta, empresa);

    const pdfBuffer = await htmlToPdf(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${venta.numero_factura}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error("[ventas] Error generando PDF:", error);
    return res
      .status(500)
      .json({ error: "Error generando PDF", detalle: error.message });
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