import { db } from "../config/database";
import { Produto } from "../types/produto";

export class ProdutoModel {
  static async findAll(): Promise<Produto[]> {
    const [rows] = await db.query(
      "SELECT * FROM produtos ORDER BY id_produto"
    );

    return rows as Produto[];
  }

  static async findById(id: number): Promise<Produto | null> {
    const [rows] = await db.query(
      "SELECT * FROM produtos WHERE id_produto = ?",
      [id]
    );

    const produtos = rows as Produto[];

    return produtos.length > 0 ? produtos[0] : null;
  }

  static async create(
    codigo_barras: string,
    nome: string,
    descricao: string | null,
    preco: number,
    estoque: number,
    tamanho: string | null,
    cor: string | null,
    ativo: boolean
  ): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO produtos
       (codigo_barras, nome, descricao, preco, estoque, tamanho, cor, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_barras,
        nome,
        descricao,
        preco,
        estoque,
        tamanho,
        cor,
        ativo,
      ]
    );

    const insertResult = result as { insertId: number };

    return insertResult.insertId;
  }

  static async update(
    id: number,
    codigo_barras: string,
    nome: string,
    descricao: string | null,
    preco: number,
    estoque: number,
    tamanho: string | null,
    cor: string | null,
    ativo: boolean
  ): Promise<boolean> {
    const [result] = await db.execute(
      `UPDATE produtos
       SET codigo_barras = ?,
           nome = ?,
           descricao = ?,
           preco = ?,
           estoque = ?,
           tamanho = ?,
           cor = ?,
           ativo = ?
       WHERE id_produto = ?`,
      [
        codigo_barras,
        nome,
        descricao,
        preco,
        estoque,
        tamanho,
        cor,
        ativo,
        id,
      ]
    );

    const updateResult = result as { affectedRows: number };

    return updateResult.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute(
      "DELETE FROM produtos WHERE id_produto = ?",
      [id]
    );

    const deleteResult = result as { affectedRows: number };

    return deleteResult.affectedRows > 0;
  }
}