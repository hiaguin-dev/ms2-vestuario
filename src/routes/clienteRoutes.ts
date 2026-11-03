import { Router } from "express";
import { ClienteController } from "../controllers/clienteController";

const router = Router();

router.get("/", ClienteController.findAll);
router.get("/:id", ClienteController.findById);
router.post("/", ClienteController.create);
router.put("/:id", ClienteController.update);
router.delete("/:id", ClienteController.delete);

export default router;
