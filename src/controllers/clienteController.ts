
import { Request, Response } from "express";
import { ClienteModel } from "../models/clienteModel";

export class ClienteController {
  static async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const clientes = await ClienteModel.findAll();
      res.status(200).json(clientes);
    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID inválido." });
        return;
      }

      const cliente = await ClienteModel.findById(id);

      if (!cliente) {
        res.status(404).json({ mensagem: "Cliente não encontrado." });
        return;
      }

      res.status(200).json(cliente);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nome, cpf, telefone, email } = req.body;

      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof cpf !== "string" ||
        !cpf.trim()
      ) {
        res.status(400).json({
          mensagem: "Nome e CPF são obrigatórios.",
        });
        return;
      }

      if (
        telefone !== undefined &&
        telefone !== null &&
        typeof telefone !== "string"
      ) {
        res.status(400).json({ mensagem: "Telefone inválido." });
        return;
      }

      if (email !== undefined && email !== null && typeof email !== "string") {
        res.status(400).json({ mensagem: "E-mail inválido." });
        return;
      }

      const cpfNormalizado = cpf.trim();
      const clienteExistente = await ClienteModel.findByCpf(cpfNormalizado);

      if (clienteExistente) {
        res.status(409).json({
          mensagem: "Já existe um cliente cadastrado com esse CPF.",
        });
        return;
      }

      const id = await ClienteModel.create(
        nome.trim(),
        cpfNormalizado,
        telefone?.trim() || null,
        email?.trim() || null,
      );

      res.status(201).json({
        mensagem: "Cliente cadastrado com sucesso.",
        id_cliente: id,
      });
    } catch (error) {
      const erro = error as { code?: string };

      if (erro.code === "ER_DUP_ENTRY") {
        res.status(409).json({
          mensagem: "Já existe um cliente cadastrado com esse CPF.",
        });
        return;
      }

      console.error("Erro ao cadastrar cliente:", error);
      res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { nome, cpf, telefone, email } = req.body;

      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID inválido." });
        return;
      }

      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof cpf !== "string" ||
        !cpf.trim()
      ) {
        res.status(400).json({
          mensagem: "Nome e CPF são obrigatórios.",
        });
        return;
      }

      if (
        telefone !== undefined &&
        telefone !== null &&
        typeof telefone !== "string"
      ) {
        res.status(400).json({ mensagem: "Telefone inválido." });
        return;
      }

      if (email !== undefined && email !== null && typeof email !== "string") {
        res.status(400).json({ mensagem: "E-mail inválido." });
        return;
      }

      const clienteAtual = await ClienteModel.findById(id);

      if (!clienteAtual) {
        res.status(404).json({ mensagem: "Cliente não encontrado." });
        return;
      }

      if (!clienteAtual.ativo) {
        res.status(409).json({
          mensagem: "Não é possível atualizar um cliente inativo.",
        });
        return;
      }

      const cpfNormalizado = cpf.trim();
      const clienteComCpf = await ClienteModel.findByCpf(cpfNormalizado);

      if (
        clienteComCpf &&
        clienteComCpf.id_cliente !== id
      ) {
        res.status(409).json({
          mensagem: "Já existe outro cliente cadastrado com esse CPF.",
        });
        return;
      }

      const atualizado = await ClienteModel.update(
        id,
        nome.trim(),
        cpfNormalizado,
        telefone?.trim() || null,
        email?.trim() || null,
      );

      res.status(200).json({
        mensagem: atualizado
          ? "Cliente atualizado com sucesso."
          : "Nenhuma alteração realizada.",
      });
    } catch (error) {
      const erro = error as { code?: string };

      if (erro.code === "ER_DUP_ENTRY") {
        res.status(409).json({
          mensagem: "Já existe outro cliente cadastrado com esse CPF.",
        });
        return;
      }

      console.error("Erro ao atualizar cliente:", error);
      res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID inválido." });
        return;
      }

      const cliente = await ClienteModel.findById(id);

      if (!cliente) {
        res.status(404).json({ mensagem: "Cliente não encontrado." });
        return;
      }

      if (!cliente.ativo) {
        res.status(409).json({
          mensagem: "Esse cliente já está inativo.",
        });
        return;
      }

      const desativado = await ClienteModel.deactivate(id);

      if (!desativado) {
        res.status(409).json({
          mensagem: "Não foi possível desativar o cliente.",
        });
        return;
      }

      res.status(200).json({
        mensagem: "Cliente desativado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao desativar cliente:", error);
      res.status(500).json({
        mensagem: "Erro interno do servidor.",
      });
    }
  }
}
