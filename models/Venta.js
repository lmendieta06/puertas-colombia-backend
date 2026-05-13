import { query, getClient } from "../config/db.js";

/**
 * Genera el siguiente número de factura con formato FV-AAAA-NNNN.
 * El correlativo se reinicia cada año.
 */
export async function generarNumeroFactura() {
  const anio = new Date().getFullYear();
  const prefijo = `FV-${anio}-`;

  const { rows } = await query(
    "SELECT COUNT(*)::int AS total FROM ventas WHERE numero_factura LIKE $1",
    [`${prefijo}%`],
  );

  const correlativo = String(rows[0].total + 1).padStart(4, "0");
  return `${prefijo}${correlativo}`;
}

/**
 * Crea una venta y sus items dentro de una transacción.
 */
export async function crearVenta(venta, items) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    const ventaResult = await client.query(
      `INSERT INTO ventas (
        numero_factura, fecha_emision, fecha_vencimiento,
        cliente_nombre, cliente_documento, cliente_email, cliente_telefono,
        cliente_ciudad, cliente_direccion, cliente_notas,
        metodo_pago, subtotal, iva, descuento, retencion, envio, total
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *`,
      [
        venta.numero_factura,
        venta.fecha_emision,
        venta.fecha_vencimiento,
        venta.cliente_nombre,
        venta.cliente_documento,
        venta.cliente_email,
        venta.cliente_telefono,
        venta.cliente_ciudad,
        venta.cliente_direccion,
        venta.cliente_notas,
        venta.metodo_pago,
        venta.subtotal,
        venta.iva,
        venta.descuento,
        venta.retencion,
        venta.envio,
        venta.total,
      ],
    );

    const ventaCreada = ventaResult.rows[0];
    const itemsCreados = [];

    for (const item of items) {
      const itemResult = await client.query(
        `INSERT INTO venta_items (
          venta_id, producto_id, descripcion, cantidad, precio_unitario, total_linea
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          ventaCreada.id,
          item.producto_id,
          item.descripcion,
          item.cantidad,
          item.precio_unitario,
          item.total_linea,
        ],
      );
      itemsCreados.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");
    return { ...ventaCreada, items: itemsCreados };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listarVentas() {
  const { rows } = await query(
    "SELECT * FROM ventas ORDER BY creado_en DESC LIMIT 100",
  );
  return rows;
}

export async function obtenerVentaPorId(id) {
  const { rows: ventaRows } = await query(
    "SELECT * FROM ventas WHERE id = $1",
    [id],
  );
  if (ventaRows.length === 0) return null;

  const { rows: itemsRows } = await query(
    "SELECT * FROM venta_items WHERE venta_id = $1 ORDER BY id",
    [id],
  );

  return { ...ventaRows[0], items: itemsRows };
}