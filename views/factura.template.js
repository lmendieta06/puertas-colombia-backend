/**
 * Plantilla HTML de la factura que se envía como cuerpo del correo.
 * Replica el diseño de la imagen modelo (cabecera azul, datos cliente, tabla, totales).
 *
 * Usa estilos inline porque la mayoría de clientes de correo (Gmail, Outlook)
 * ignoran <style> externos y muchos selectores CSS.
 */

function formatearCOP(valor) {
  const numero = Number(valor) || 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numero);
}

function formatearFecha(fecha) {
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = String(d.getFullYear()).slice(-2);
  return `${dia}/${mes}/${anio}`;
}

export function plantillaFactura(venta, empresa) {
  const itemsHtml = venta.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#1e3a8a;font-weight:600;text-align:center;">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.descripcion)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.cantidad}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatearCOP(item.precio_unitario)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${formatearCOP(item.total_linea)}</td>
      </tr>
    `,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura ${venta.numero_factura}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111827;">
  <div style="max-width:760px;margin:0 auto;padding:24px 16px;">

    <!-- CABECERA AZUL -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#1e3a8a;color:#ffffff;">
      <tr>
        <td style="padding:24px 28px;width:60%;vertical-align:top;">
          <div style="font-size:22px;font-weight:800;letter-spacing:0.5px;">${escapeHtml(empresa.nombre)}</div>
          <div style="margin-top:8px;font-size:12px;line-height:1.7;color:#dbeafe;">
            NIT: ${escapeHtml(empresa.nit)}<br>
            ${escapeHtml(empresa.direccion)}<br>
            Tel: ${escapeHtml(empresa.telefono)} &nbsp;|&nbsp; ${escapeHtml(empresa.email)}<br>
            ${escapeHtml(empresa.regimen)}
          </div>
        </td>
        <td style="padding:24px 28px;width:40%;vertical-align:top;background:#1e40af;">
          <div style="font-size:18px;font-weight:800;letter-spacing:0.5px;">FACTURA DE VENTA</div>
          <div style="margin-top:8px;font-size:14px;font-weight:700;color:#fbbf24;">No. ${escapeHtml(venta.numero_factura)}</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;font-size:12px;color:#dbeafe;">
            <tr>
              <td style="padding:3px 0;">Fecha de emisión:</td>
              <td style="padding:3px 0;text-align:right;color:#ffffff;font-weight:600;">${formatearFecha(venta.fecha_emision)}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;">Fecha de vencimiento:</td>
              <td style="padding:3px 0;text-align:right;color:#ffffff;font-weight:600;">${formatearFecha(venta.fecha_vencimiento)}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;">Resolución DIAN:</td>
              <td style="padding:3px 0;text-align:right;color:#ffffff;font-weight:600;">${escapeHtml(empresa.resolucion_dian)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- INFORMACIÓN DEL CLIENTE -->
    <div style="background:#1e3a8a;color:#ffffff;padding:10px 28px;font-size:13px;font-weight:700;letter-spacing:0.5px;">
      INFORMACIÓN DEL CLIENTE
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-collapse:collapse;">
      <tr>
        <td style="padding:12px 16px 6px 28px;width:50%;font-size:12px;color:#6b7280;">Razón Social / Nombre:</td>
        <td style="padding:12px 28px 6px 16px;width:50%;font-size:12px;color:#6b7280;">NIT / CC:</td>
      </tr>
      <tr>
        <td style="padding:0 16px 12px 28px;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">${escapeHtml(venta.cliente_nombre)}</td>
        <td style="padding:0 28px 12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">${escapeHtml(venta.cliente_documento || "N/A")}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px 6px 28px;font-size:12px;color:#6b7280;">Dirección:</td>
        <td style="padding:12px 28px 6px 16px;font-size:12px;color:#6b7280;">Ciudad:</td>
      </tr>
      <tr>
        <td style="padding:0 16px 12px 28px;font-size:13px;border-bottom:1px solid #e5e7eb;">${escapeHtml(venta.cliente_direccion || "—")}</td>
        <td style="padding:0 28px 12px 16px;font-size:13px;border-bottom:1px solid #e5e7eb;">${escapeHtml(venta.cliente_ciudad || "—")}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px 6px 28px;font-size:12px;color:#6b7280;">Teléfono:</td>
        <td style="padding:12px 28px 6px 16px;font-size:12px;color:#6b7280;">Correo electrónico:</td>
      </tr>
      <tr>
        <td style="padding:0 16px 12px 28px;font-size:13px;border-bottom:1px solid #e5e7eb;">${escapeHtml(venta.cliente_telefono || "—")}</td>
        <td style="padding:0 28px 12px 16px;font-size:13px;border-bottom:1px solid #e5e7eb;">${escapeHtml(venta.cliente_email)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px 6px 28px;font-size:12px;color:#6b7280;">Régimen:</td>
        <td style="padding:12px 28px 6px 16px;font-size:12px;color:#6b7280;">Forma de pago:</td>
      </tr>
      <tr>
        <td style="padding:0 16px 14px 28px;font-size:13px;">N/A</td>
        <td style="padding:0 28px 14px 16px;font-size:13px;">${escapeHtml(formatearMetodoPago(venta.metodo_pago))}</td>
      </tr>
    </table>

    <!-- DETALLE DE PRODUCTOS -->
    <div style="background:#1e3a8a;color:#ffffff;padding:10px 28px;font-size:13px;font-weight:700;letter-spacing:0.5px;">
      DETALLE DE PRODUCTOS / SERVICIOS
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-collapse:collapse;">
      <thead>
        <tr style="background:#3b82f6;color:#ffffff;">
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-align:center;width:8%;">#</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-align:left;">Descripción del producto / servicio</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-align:center;width:12%;">Cantidad</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-align:right;width:18%;">Vlr. Unitario</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-align:right;width:18%;">Total Bruto</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- TOTALES -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-collapse:collapse;margin-top:24px;">
      <tr>
        <td style="padding:8px 28px;text-align:right;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Subtotal (sin IVA):</td>
        <td style="padding:8px 28px;text-align:right;font-size:13px;font-weight:600;width:25%;border-bottom:1px solid #e5e7eb;">${formatearCOP(venta.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:8px 28px;text-align:right;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">IVA (${process.env.IVA_PORCENTAJE || 19}%):</td>
        <td style="padding:8px 28px;text-align:right;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">${formatearCOP(venta.iva)}</td>
      </tr>
      <tr>
        <td style="padding:8px 28px;text-align:right;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Descuento:</td>
        <td style="padding:8px 28px;text-align:right;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">${formatearCOP(venta.descuento)}</td>
      </tr>
      <tr>
        <td style="padding:8px 28px;text-align:right;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Retención en la fuente (${process.env.RETENCION_PORCENTAJE || 3.5}%):</td>
        <td style="padding:8px 28px;text-align:right;font-size:13px;font-weight:600;color:#dc2626;border-bottom:1px solid #e5e7eb;">-${formatearCOP(venta.retencion)}</td>
      </tr>
      <tr style="background:#1e3a8a;color:#ffffff;">
        <td style="padding:14px 28px;text-align:right;font-size:15px;font-weight:800;letter-spacing:0.5px;">TOTAL A PAGAR:</td>
        <td style="padding:14px 28px;text-align:right;font-size:18px;font-weight:800;color:#fbbf24;">${formatearCOP(venta.total)}</td>
      </tr>
    </table>

    ${
      venta.cliente_notas
        ? `<div style="background:#fffbeb;border-left:4px solid #fbbf24;padding:14px 20px;margin-top:20px;font-size:13px;color:#78350f;">
            <strong>Indicaciones del cliente:</strong><br>
            ${escapeHtml(venta.cliente_notas)}
          </div>`
        : ""
    }

    <!-- PIE -->
    <div style="background:#1e3a8a;color:#dbeafe;padding:20px 28px;margin-top:24px;text-align:center;font-size:12px;line-height:1.7;">
      <div style="color:#fbbf24;font-weight:700;letter-spacing:1px;margin-bottom:6px;">GRACIAS POR TU COMPRA</div>
      Donde cada puerta cuenta una historia.<br>
      <span style="color:#93c5fd;">${escapeHtml(empresa.email)} · ${escapeHtml(empresa.telefono)}</span>
    </div>

  </div>
</body>
</html>`;
}

function formatearMetodoPago(metodo) {
  const mapa = {
    pse: "PSE",
    card: "Tarjeta crédito/débito",
    nequi: "Nequi",
    daviplata: "Daviplata",
    transfer: "Transferencia bancaria",
    efectivo: "Efectivo",
  };
  return mapa[metodo] || metodo;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}