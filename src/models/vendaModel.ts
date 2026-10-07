import { db } from "../config/database";
import { Venda } from "../types/venda";

export class VendaModel {
  static async findAll(): Promise<Venda[]> {
    const [rows] = await db.query(
      "SELECT * FROM vendas ORDER BY id_venda"
    );

    return rows as Venda[];
  }

  static async findById(id: number): Promise<Venda | null> {
    const [rows] = await db.query(
      "SELECT * FROM vendas WHERE id_venda = ?",
      [id]
    );

    const vendas = rows as Venda[];

    return vendas.length > 0 ? vendas[0] : null;
  }

  static async create(
    id_cliente: number | null,
    id_usuario: number,
    subtotal: number,
    desconto: number,
    total: number,
    forma_pagamento: Venda["forma_pagamento"],
    status: Venda["status"]
  ): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO vendas
       (id_cliente, id_usuario, subtotal, desconto, total, forma_pagamento, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id_cliente,
        id_usuario,
        subtotal,
        desconto,
        total,
        forma_pagamento,
        status,
      ]
    );

    const insertResult = result as { insertId: number };

    return insertResult.insertId;
  }

  static async update(
    id: number,
    id_cliente: number | null,
    id_usuario: number,
    subtotal: number,
    desconto: number,
    total: number,
    forma_pagamento: Venda["forma_pagamento"],
    status: Venda["status"]
  ): Promise<boolean> {
    const [result] = await db.execute(
      `UPDATE vendas
       SET id_cliente = ?,
           id_usuario = ?,
           subtotal = ?,
           desconto = ?,
           total = ?,
           forma_pagamento = ?,
           status = ?
       WHERE id_venda = ?`,
      [
        id_cliente,
        id_usuario,
        subtotal,
        desconto,
        total,
        forma_pagamento,
        status,
        id,
      ]
    );

    const updateResult = result as { affectedRows: number };

    return updateResult.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await db.execute(
      "DELETE FROM vendas WHERE id_venda = ?",
      [id]
    );

    const deleteResult = result as { affectedRows: number };

    return deleteResult.affectedRows > 0;
  }
}