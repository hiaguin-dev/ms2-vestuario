
import { Request, Response } from "express";
import { VendaModel } from "../models/vendaModel";

export class VendaController {
  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const vendas = await VendaModel.findAll();
      res.status(200).json(vendas);
    } catch (error) {
      console.error("Erro ao listar vendas:", error);
      res.status(500).json({
        mensagem: "Erro interno ao listar vendas.",
      });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID de venda inválido." });
        return;
      }

      const venda = await VendaModel.findById(id);

      if (!venda) {
        res.status(404).json({ mensagem: "Venda não encontrada." });
        return;
      }

      res.status(200).json(venda);
    } catch (error) {
      console.error("Erro ao buscar venda:", error);
      res.status(500).json({
        mensagem: "Erro interno ao buscar venda.",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const usuarioAutenticado = req.usuario;

      if (!usuarioAutenticado) {
        res.status(401).json({
          mensagem: "Usuário não autenticado.",
        });
        return;
      }

      const {
        id_cliente,
        produtos,
        desconto,
        forma_pagamento,
      } = req.body;

      if (
        id_cliente !== null &&
        id_cliente !== undefined &&
        (!Number.isInteger(id_cliente) || id_cliente <= 0)
      ) {
        res.status(400).json({
          mensagem: "ID do cliente inválido.",
        });
        return;
      }

      if (!Array.isArray(produtos) || produtos.length === 0) {
        res.status(400).json({
          mensagem: "Informe pelo menos um produto para a venda.",
        });
        return;
      }

      if (
        typeof desconto !== "number" ||
        !Number.isFinite(desconto) ||
        desconto < 0
      ) {
        res.status(400).json({
          mensagem:
            "O desconto deve ser um valor numérico igual ou maior que zero.",
        });
        return;
      }

      const venda = await VendaModel.create(
        id_cliente ?? null,
        usuarioAutenticado.id_usuario,
        usuarioAutenticado.tipo,
        produtos,
        desconto,
        forma_pagamento,
      );

      res.status(201).json({
        mensagem: "Venda registrada com sucesso.",
        venda,
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro interno ao registrar venda.";

      console.error("Erro ao registrar venda:", error);

      const errosDeValidacao = [
        "A venda precisa ter pelo menos um produto.",
        "O desconto deve ser um valor igual ou maior que zero.",
        "Forma de pagamento inválida.",
        "Produto ou quantidade inválida.",
      ];

      const erroDeRegra =
        errosDeValidacao.includes(mensagem) ||
        mensagem.includes("não encontrado") ||
        mensagem.includes("inativo") ||
        mensagem.includes("Estoque insuficiente") ||
        mensagem.includes("desconto não pode ser maior") ||
        mensagem.includes("limite máximo de desconto");

      res.status(erroDeRegra ? 400 : 500).json({
        mensagem: erroDeRegra ? mensagem : "Erro interno ao registrar venda.",
      });
    }
  }
}
