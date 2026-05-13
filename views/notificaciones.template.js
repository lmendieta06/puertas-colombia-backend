/**
 * Plantillas HTML simples para notificaciones internas a la tienda.
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function plantillaContacto(contacto) {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#1e3a8a;color:#ffffff;padding:18px 24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#fbbf24;">PUERTAS COLOMBIA</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px;">Nuevo mensaje de contacto</div>
    </div>
    <div style="padding:24px;color:#111827;font-size:14px;line-height:1.7;">
      <p style="margin:0 0 16px 0;color:#6b7280;">Recibiste un mensaje desde el formulario de "Contáctanos":</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;width:120px;">Nombre:</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(contacto.nombre)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Correo:</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(contacto.email)}" style="color:#1e3a8a;">${escapeHtml(contacto.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Teléfono:</td><td style="padding:8px 0;">${escapeHtml(contacto.telefono || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Ciudad:</td><td style="padding:8px 0;">${escapeHtml(contacto.ciudad || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Asunto:</td><td style="padding:8px 0;">${escapeHtml(contacto.asunto || "—")}</td></tr>
      </table>

      <div style="margin-top:16px;padding:16px;background:#f9fafb;border-left:4px solid #1e3a8a;border-radius:4px;">
        <div style="font-size:12px;color:#6b7280;letter-spacing:1px;margin-bottom:6px;">MENSAJE</div>
        <div style="white-space:pre-wrap;">${escapeHtml(contacto.mensaje)}</div>
      </div>

      <p style="margin:24px 0 0 0;font-size:12px;color:#9ca3af;">Registrado el ${new Date(contacto.creado_en).toLocaleString("es-CO")}</p>
    </div>
  </div>
</body></html>`;
}

export function plantillaComentario(comentario) {
  const estrellas = "★".repeat(comentario.calificacion) + "☆".repeat(5 - comentario.calificacion);

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#1e3a8a;color:#ffffff;padding:18px 24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#fbbf24;">PUERTAS COLOMBIA · BLOG</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px;">Nuevo comentario publicado</div>
    </div>
    <div style="padding:24px;color:#111827;font-size:14px;line-height:1.7;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;width:120px;">Nombre:</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(comentario.nombre)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Ciudad:</td><td style="padding:8px 0;">${escapeHtml(comentario.ciudad || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Calificación:</td><td style="padding:8px 0;color:#fbbf24;font-size:18px;">${estrellas} <span style="color:#6b7280;font-size:13px;">(${comentario.calificacion}/5)</span></td></tr>
      </table>

      <div style="margin-top:16px;padding:16px;background:#f9fafb;border-left:4px solid #1e3a8a;border-radius:4px;">
        <div style="font-size:12px;color:#6b7280;letter-spacing:1px;margin-bottom:6px;">COMENTARIO</div>
        <div style="white-space:pre-wrap;">${escapeHtml(comentario.mensaje)}</div>
      </div>

      <p style="margin:24px 0 0 0;font-size:12px;color:#9ca3af;">Publicado el ${new Date(comentario.creado_en).toLocaleString("es-CO")}</p>
    </div>
  </div>
</body></html>`;
}