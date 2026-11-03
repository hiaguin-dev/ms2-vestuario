import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import clienteRoutes from "./routes/clienteRoutes";
import produtoRoutes from "./routes/produtoRoutes";
import vendaRoutes from "./routes/vendaRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/usuarios", usuarioRoutes);

const PORT = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.json({
    mensagem: "MS2 Vestuário API",
    status: "online",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});