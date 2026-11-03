
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TipoUsuario } from "../types/usuario";

interface TokenPayload {
  id_usuario: number;
  tipo: TipoUsuario;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({
      mensagem: "Token de autenticação não informado.",
    });
    return;
  }

  const token = authorization.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET não configurado.");

    res.status(500).json({
      mensagem: "Erro interno do servidor.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "string" ||
      !Number.isInteger(decoded.id_usuario) ||
      decoded.id_usuario <= 0 ||
      (decoded.tipo !== "CAIXA" && decoded.tipo !== "GERENTE")
    ) {
      res.status(401).json({
        mensagem: "Token inválido.",
      });
      return;
    }

    const usuario: TokenPayload = {
      id_usuario: decoded.id_usuario,
      tipo: decoded.tipo,
    };

    req.usuario = usuario;

    next();
  } catch {
    res.status(401).json({
      mensagem: "Token inválido ou expirado.",
    });
  }
}
