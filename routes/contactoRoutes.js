import { Router } from "express";
import {
  crearContacto,
  listarContactos,
} from "../controllers/contactoController.js";

const router = Router();

router.post("/", crearContacto);
router.get("/", listarContactos);

export default router;