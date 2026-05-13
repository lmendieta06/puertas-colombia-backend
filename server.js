import "dotenv/config";
import express from "express";
import cors from "cors";

import ventaRoutes from "./routes/ventaRoutes.js";
import contactoRoutes from "./routes/contactoRoutes.js";
import comentarioRoutes from "./routes/comentarioRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ============ CORS ============
// Acepta múltiples orígenes separados por coma en FRONTEND_URL.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Peticiones sin origin (curl, Postman, same-origin) se permiten.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado para origen: ${origin}`));
    },
    credentials: true,
  }),
);

// ============ MIDDLEWARES ============
app.use(express.json({ limit: "1mb" }));

// ============ HEALTHCHECK ============
app.get("/", (_req, res) => {
  res.json({
    name: "Puertas Colombia API",
    version: "1.0.0",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// ============ RUTAS ============
app.use("/api/ventas", ventaRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/comentarios", comentarioRoutes);

// ============ 404 Y ERRORES ============
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, _req, res, _next) => {
  console.error("[server] Error no capturado:", err);
  res
    .status(500)
    .json({ error: "Error interno del servidor", detalle: err.message });
});

// ============ ARRANQUE ============
app.listen(PORT, () => {
  console.log(`\n🚪 Puertas Colombia API`);
  console.log(`   Servidor: http://localhost:${PORT}`);
  console.log(`   CORS permitido: ${allowedOrigins.join(", ")}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || "development"}\n`);
});