import { Router } from "express";
import {
  crearVenta,
  listarVentas,
  obtenerVenta,
} from "../controllers/ventaController.js";

const router = Router();

router.post("/", crearVenta);
router.get("/", listarVentas);
router.get("/:id", obtenerVenta);

export default router;