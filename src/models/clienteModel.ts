
import { db } from "../config/database";
import { Cliente } from "../types/cliente";

export class ClienteModel {
  // Lista somente clientes ativos.
  static async findAll(): Promise<Cliente[]> {
    const [rows] = await db.execute(
      `SELECT * FROM clientes
       WHERE ativo = 1
       ORDER BY id_cliente`
    );

    return rows as Cliente[];
  }

  // Busca pelo ID, inclusive se o cliente estiver inativo.
  static async findById(id: number): Promise<Cliente | null> {
    const [rows] = await db.execute(
      "SELECT * FROM clientes WHERE id_cliente = ?",
      [id]
    );

    const clientes = rows as Cliente[];

    return clientes.length > 0 ? clientes[0] : null;
  }

  // Busca pelo CPF, inclusive se o cliente estiver inativo.
  static async findByCpf(cpf: string): Promise<Cliente | null> {
    const [rows] = await db.execute(
      "SELECT * FROM clientes WHERE cpf = ?",
      [cpf]
    );

    const clientes = rows as Cliente[];

    return clientes.length > 0 ? clientes[0] : null;
  }

  static async create(
    nome: string,
    cpf: string,
    telefone: string | null,
    email: string | null
  ): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO clientes
       (nome, cpf, telefone, email, ativo)
       VALUES (?, ?, ?, ?, 1)`,
      [nome, cpf, telefone, email]
    );

    const insertResult = result as { insertId: number };

    return insertResult.insertId;
  }

  // Atualiza somente clientes ativos.
  static async update(
    id: number,
    nome: string,
    cpf: string,
    telefone: string | null,
    email: string | null
  ): Promise<boolean> {
    const [result] = await db.execute(
      `UPDATE clientes
       SET nome = ?, cpf = ?, telefone = ?, email = ?
       WHERE id_cliente = ? AND ativo = 1`,
      [nome, cpf, telefone, email, id]
    );

    const updateResult = result as { affectedRows: number };

    return updateResult.affectedRows > 0;
  }

  // Desativa o cliente sem apagar seus dados.
  static async deactivate(id: number): Promise<boolean> {
    const [result] = await db.execute(
      `UPDATE clientes
       SET ativo = 0
       WHERE id_cliente = ? AND ativo = 1`,
      [id]
    );

    const deactivateResult = result as { affectedRows: number };

    return deactivateResult.affectedRows > 0;
  }
}
