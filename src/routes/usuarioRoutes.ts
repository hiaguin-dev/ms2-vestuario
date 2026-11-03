
import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Todas as rotas exigem autenticação.
router.use(authMiddleware);

// Cadastro permitido somente para GERENTE.
router.post("/", UsuarioController.create);

export default router;
