
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UsuarioModel } from "../models/usuarioModel";
import { TipoUsuario } from "../types/usuario";

export class UsuarioController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const usuarioAutenticado = req.usuario;

      if (!usuarioAutenticado) {
        res.status(401).json({
          mensagem: "Usuário não autenticado.",
        });
        return;
      }

      if (usuarioAutenticado.tipo !== "GERENTE") {
        res.status(403).json({
          mensagem: "Somente GERENTES podem cadastrar usuários.",
        });
        return;
      }

      const { nome, email, senha, tipo } = req.body;

      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof senha !== "string" ||
        senha.length < 8 ||
        (tipo !== "CAIXA" && tipo !== "GERENTE")
      ) {
        res.status(400).json({
          mensagem:
            "Informe nome, e-mail válido, senha com pelo menos 8 caracteres e tipo CAIXA ou GERENTE.",
        });
        return;
      }

      const emailNormalizado = email.trim().toLowerCase();

      const usuarioExistente =
        await UsuarioModel.findByEmail(emailNormalizado);

      if (usuarioExistente) {
        res.status(409).json({
          mensagem: "Já existe um usuário cadastrado com esse e-mail.",
        });
        return;
      }

      const senhaHash = await bcrypt.hash(senha, 12);

      const id_usuario = await UsuarioModel.create(
        nome.trim(),
        emailNormalizado,
        senhaHash,
        tipo as TipoUsuario,
        true,
      );

      res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso.",
        usuario: {
          id_usuario,
          nome: nome.trim(),
          email: emailNormalizado,
          tipo,
        },
      });
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);

      res.status(500).json({
        mensagem: "Erro interno ao cadastrar usuário.",
      });
    }
  }
}
