import { Router } from "express";
import { ProdutoController } from "../controllers/produtoController";

const router = Router();

router.get("/", ProdutoController.findAll);
router.get("/:id", ProdutoController.findById);
router.post("/", ProdutoController.create);
router.put("/:id", ProdutoController.update);
router.delete("/:id", ProdutoController.delete);

export default router;
