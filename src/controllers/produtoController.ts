import { Request, Response } from "express";
import { ProdutoModel } from "../models/produtoModel";

export class ProdutoController {
  static async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const produtos = await ProdutoModel.findAll();
      res.status(200).json(produtos);
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      res.status(500).json({
        mensagem: "Erro interno do servidor.",
      });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID inválido." });
        return;
      }

      const produto = await ProdutoModel.findById(id);

      if (!produto) {
        res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
        return;
      }

      res.status(200).json(produto);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      res.status(500).json({
        mensagem: "Erro interno do servidor.",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        codigo_barras,
        nome,
        descricao,
        preco,
        estoque,
        tamanho,
        cor,
        ativo,
      } = req.body;

      if (
        typeof codigo_barras !== "string" ||
        !codigo_barras.trim() ||
        typeof nome !== "string" ||
        !nome.trim()
      ) {
        res.status(400).json({
          mensagem: "Código de barras e nome são obrigatórios.",
        });
        return;
      }

      if (typeof preco !== "number" || !Number.isFinite(preco) || preco <= 0) {
        res.status(400).json({
          mensagem: "O preço deve ser um número maior que zero.",
        });
        return;
      }

      if (!Number.isInteger(estoque) || estoque < 0) {
        res.status(400).json({
          mensagem:
            "O estoque deve ser um número inteiro igual ou maior que zero.",
        });
        return;
      }

      if (
        descricao !== undefined &&
        descricao !== null &&
        typeof descricao !== "string"
      ) {
        res.status(400).json({ mensagem: "Descrição inválida." });
        return;
      }

      if (
        tamanho !== undefined &&
        tamanho !== null &&
        typeof tamanho !== "string"
      ) {
        res.status(400).json({ mensagem: "Tamanho inválido." });
        return;
      }

      if (cor !== undefined && cor !== null && typeof cor !== "string") {
        res.status(400).json({ mensagem: "Cor inválida." });
        return;
      }

      if (ativo !== undefined && typeof ativo !== "boolean") {
        res.status(400).json({
          mensagem: "O campo ativo deve ser booleano.",
        });
        return;
      }

      const id = await ProdutoModel.create(
        codigo_barras.trim(),
        nome.trim(),
        descricao?.trim() || null,
        preco,
        estoque,
        tamanho?.trim() || null,
        cor?.trim() || null,
        ativo ?? true,
      );

      res.status(201).json({
        mensagem: "Produto cadastrado com sucesso.",
        id_produto: id,
      });
    } catch (error: unknown) {
      console.error("Erro ao cadastrar produto:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ER_DUP_ENTRY"
      ) {
        res.status(409).json({
          mensagem:
            "Já existe um produto cadastrado com esse código de barras.",
        });
        return;
      }

      res.status(500).json({
        mensagem: "Erro interno ao cadastrar produto.",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID inválido." });
        return;
      }

      const produtoAtual = await ProdutoModel.findById(id);

      if (!produtoAtual) {
        res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
        return;
      }

      const {
        codigo_barras,
        nome,
        descricao,
        preco,
        estoque,
        tamanho,
        cor,
        ativo,
      } = req.body;

      if (
        typeof codigo_barras !== "string" ||
        !codigo_barras.trim() ||
        typeof nome !== "string" ||
        !nome.trim()
      ) {
        res.status(400).json({
          mensagem: "Código de barras e nome são obrigatórios.",
        });
        return;
      }

      if (typeof preco !== "number" || !Number.isFinite(preco) || preco <= 0) {
        res.status(400).json({
          mensagem: "O preço deve ser um número maior que zero.",
        });
        return;
      }

      if (!Number.isInteger(estoque) || estoque < 0) {
        res.status(400).json({
          mensagem:
            "O estoque deve ser um número inteiro igual ou maior que zero.",
        });
        return;
      }

      if (
        descricao !== undefined &&
        descricao !== null &&
        typeof descricao !== "string"
      ) {
        res.status(400).json({ mensagem: "Descrição inválida." });
        return;
      }

      if (
        tamanho !== undefined &&
        tamanho !== null &&
        typeof tamanho !== "string"
      ) {
        res.status(400).json({ mensagem: "Tamanho inválido." });
        return;
      }

      if (cor !== undefined && cor !== null && typeof cor !== "string") {
        res.status(400).json({ mensagem: "Cor inválida." });
        return;
      }

      if (ativo !== undefined && typeof ativo !== "boolean") {
        res.status(400).json({
          mensagem: "O campo ativo deve ser booleano.",
        });
        return;
      }

      const atualizado = await ProdutoModel.update(
        id,
        codigo_barras.trim(),
        nome.trim(),
        descricao?.trim() || null,
        preco,
        estoque,
        tamanho?.trim() || null,
        cor?.trim() || null,
        ativo ?? produtoAtual.ativo,
      );

      res.status(200).json({
        mensagem: atualizado
          ? "Produto atualizado com sucesso."
          : "Nenhuma alteração realizada.",
      });
    } catch (error: unknown) {
      console.error("Erro ao atualizar produto:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ER_DUP_ENTRY"
      ) {
        res.status(409).json({
          mensagem:
            "Já existe um produto cadastrado com esse código de barras.",
        });
        return;
      }

      res.status(500).json({
        mensagem: "Erro interno ao atualizar produto.",
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID inválido." });
        return;
      }

      const produto = await ProdutoModel.findById(id);

      if (!produto) {
        res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
        return;
      }

      const excluido = await ProdutoModel.delete(id);

      if (!excluido) {
        res.status(409).json({
          mensagem: "Não foi possível excluir o produto.",
        });
        return;
      }

      res.status(200).json({
        mensagem: "Produto excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      res.status(500).json({
        mensagem:
          "Não foi possível excluir o produto. Ele pode estar vinculado a vendas.",
      });
    }
  }
}
