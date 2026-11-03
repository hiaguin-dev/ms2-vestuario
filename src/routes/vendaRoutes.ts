
import { Router } from "express";
import { VendaController } from "../controllers/vendaController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Todas as rotas de vendas exigem autenticação
router.use(authMiddleware);

router.get("/", VendaController.findAll);
router.get("/:id", VendaController.findById);
router.post("/", VendaController.create);

export default router;
