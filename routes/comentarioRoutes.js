import { Router } from "express";
import {
  crearComentario,
  listarComentarios,
} from "../controllers/comentarioController.js";

const router = Router();

router.get("/", listarComentarios);
router.post("/", crearComentario);

export default router;