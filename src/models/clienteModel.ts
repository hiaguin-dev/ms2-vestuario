import { db } from "../config/database";
import { Cliente } from "../types/cliente";

export class ClienteModel {
  static async findAll(): Promise<Cliente[]> {
    const [rows] = await db.query(
      "SELECT * FROM clientes ORDER BY id_cliente"
    );

    return rows as Cliente[];
  }

  static async findById(id: number): Promise<Cliente | null> {
    const [rows] = await db.query(
      "SELECT * FROM clientes WHERE id_cliente = ?",
      [id]
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
       (nome, cpf, telefone, email)
       VALUES (?, ?, ?, ?)`,
      [nome, cpf, telefone, email]
    );

    const insertResult = result as { insertId: number };

    return insertResult.insertId;
  }

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
       WHERE id_cliente = ?`,
      [nome, cpf, telefone, email, id]
    );

    const updateResult = result as { affectedRows: number };

    return updateResult.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute(
      "DELETE FROM clientes WHERE id_cliente = ?",
      [id]
    );

    const deleteResult = result as { affectedRows: number };

    return deleteResult.affectedRows > 0;
  }
}