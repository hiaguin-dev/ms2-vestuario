import { db } from "../config/database";
import { Usuario } from "../types/usuario";

export class UsuarioModel {
  static async findAll(): Promise<Usuario[]> {
    const [rows] = await db.query(
      "SELECT * FROM usuarios ORDER BY id_usuario"
    );

    return rows as Usuario[];
  }

  static async findById(id: number): Promise<Usuario | null> {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    const usuarios = rows as Usuario[];

    return usuarios.length > 0 ? usuarios[0] : null;
  }

  static async create(
    nome: string,
    email: string,
    senha: string,
    tipo: Usuario["tipo"],
    ativo: boolean
  ): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO usuarios
       (nome, email, senha, tipo, ativo)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, senha, tipo, ativo]
    );

    const insertResult = result as { insertId: number };

    return insertResult.insertId;
  }

  static async update(
    id: number,
    nome: string,
    email: string,
    senha: string,
    tipo: Usuario["tipo"],
    ativo: boolean
  ): Promise<boolean> {
    const [result] = await db.execute(
      `UPDATE usuarios
       SET nome = ?,
           email = ?,
           senha = ?,
           tipo = ?,
           ativo = ?
       WHERE id_usuario = ?`,
      [nome, email, senha, tipo, ativo, id]
    );

    const updateResult = result as { affectedRows: number };

    return updateResult.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    const deleteResult = result as { affectedRows: number };

    return deleteResult.affectedRows > 0;
  }
}