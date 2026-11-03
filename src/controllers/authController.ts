
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UsuarioModel } from "../models/usuarioModel";

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof senha !== "string" ||
        !senha
      ) {
        res.status(400).json({
          mensagem: "E-mail e senha são obrigatórios.",
        });
        return;
      }

      const usuario = await UsuarioModel.findByEmail(email.trim());

      if (!usuario || !usuario.ativo) {
        res.status(401).json({
          mensagem: "E-mail ou senha inválidos.",
        });
        return;
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        res.status(401).json({
          mensagem: "E-mail ou senha inválidos.",
        });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error("JWT_SECRET não configurado.");
        res.status(500).json({
          mensagem: "Erro interno do servidor.",
        });
        return;
      }

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          tipo: usuario.tipo,
        },
        jwtSecret,
        {
          expiresIn: "8h",
        },
      );

      res.status(200).json({
        mensagem: "Login realizado com sucesso.",
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
        },
      });
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      res.status(500).json({
        mensagem: "Erro interno ao realizar login.",
      });
    }
  }
}
