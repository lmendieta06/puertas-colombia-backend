import { Router } from "express";
import {
  crearVenta,
  listarVentas,
  obtenerVenta,
  descargarFacturaPDF,
} from "../controllers/ventaController.js";

const router = Router();

router.post("/", crearVenta);
router.get("/", listarVentas);
router.get("/:numeroFactura/pdf", descargarFacturaPDF);
router.get("/:id", obtenerVenta);

export default router;