import { db } from "../config/database";
import { ItemVenda } from "../types/itemVenda";

export class ItemVendaModel {
  static async findAll(): Promise<ItemVenda[]> {
    const [rows] = await db.query(
      "SELECT * FROM itens_venda ORDER BY id_item"
    );

    return rows as ItemVenda[];
  }

  static async findById(id: number): Promise<ItemVenda | null> {
    const [rows] = await db.query(
      "SELECT * FROM itens_venda WHERE id_item = ?",
      [id]
    );

    const itens = rows as ItemVenda[];

    return itens.length > 0 ? itens[0] : null;
  }

  static async create(
    id_venda: number,
    id_produto: number,
    quantidade: number,
    preco_unitario: number,
    subtotal: number
  ): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO itens_venda
       (id_venda, id_produto, quantidade, preco_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id_venda,
        id_produto,
        quantidade,
        preco_unitario,
        subtotal,
      ]
    );

    const insertResult = result as { insertId: number };

    return insertResult.insertId;
  }

  static async update(
    id: number,
    id_venda: number,
    id_produto: number,
    quantidade: number,
    preco_unitario: number,
    subtotal: number
  ): Promise<boolean> {
    const [result] = await db.execute(
      `UPDATE itens_venda
       SET id_venda = ?,
           id_produto = ?,
           quantidade = ?,
           preco_unitario = ?,
           subtotal = ?
       WHERE id_item = ?`,
      [
        id_venda,
        id_produto,
        quantidade,
        preco_unitario,
        subtotal,
        id,
      ]
    );

    const updateResult = result as { affectedRows: number };

    return updateResult.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute(
      "DELETE FROM itens_venda WHERE id_item = ?",
      [id]
    );

    const deleteResult = result as { affectedRows: number };

    return deleteResult.affectedRows > 0;
  }
}