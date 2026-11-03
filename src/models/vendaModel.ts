
import { db } from "../config/database";
import { Venda } from "../types/venda";
import { TipoUsuario } from "../types/usuario";
import { ItemVendaModel } from "./itemVendaModel";

interface ProdutoVenda {
  id_produto: number;
  quantidade: number;
}

interface ResultadoVenda {
  id_venda: number;
  subtotal: number;
  desconto: number;
  total: number;
}

interface ProdutoBanco {
  id_produto: number;
  preco: number | string;
  estoque: number;
  ativo: number | boolean;
}

interface ClienteBanco {
  id_cliente: number;
  ativo: number | boolean;
}

interface ItemVendaDetalhado {
  id_item: number;
  id_venda: number;
  id_produto: number;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

interface VendaDetalhada extends Venda {
  itens: ItemVendaDetalhado[];
}

export class VendaModel {
  static async findAll(): Promise<Venda[]> {
    const [rows] = await db.query(
      "SELECT * FROM vendas ORDER BY id_venda DESC",
    );

    return rows as Venda[];
  }

  static async findById(id: number): Promise<VendaDetalhada | null> {
    const [rows] = await db.execute(
      "SELECT * FROM vendas WHERE id_venda = ?",
      [id],
    );

    const vendas = rows as Venda[];

    if (vendas.length === 0) {
      return null;
    }

    const venda = vendas[0];

    const [itemRows] = await db.execute(
      `SELECT
         iv.id_item,
         iv.id_venda,
         iv.id_produto,
         p.nome AS nome_produto,
         iv.quantidade,
         iv.preco_unitario,
         iv.subtotal
       FROM itens_venda iv
       INNER JOIN produtos p
         ON p.id_produto = iv.id_produto
       WHERE iv.id_venda = ?
       ORDER BY iv.id_item`,
      [id],
    );

    return {
      ...venda,
      itens: itemRows as ItemVendaDetalhado[],
    };
  }

  static async create(
    id_cliente: number | null,
    id_usuario: number,
    tipo_usuario: TipoUsuario,
    produtos: ProdutoVenda[],
    desconto: number,
    forma_pagamento: Venda["forma_pagamento"],
  ): Promise<ResultadoVenda> {
    if (!Array.isArray(produtos) || produtos.length === 0) {
      throw new Error("A venda precisa ter pelo menos um produto.");
    }

    if (!Number.isSafeInteger(id_usuario) || id_usuario <= 0) {
      throw new Error("ID do usuário inválido.");
    }

    if (tipo_usuario !== "CAIXA" && tipo_usuario !== "GERENTE") {
      throw new Error("Tipo de usuário inválido.");
    }

    if (
      id_cliente !== null &&
      (!Number.isSafeInteger(id_cliente) || id_cliente <= 0)
    ) {
      throw new Error("ID do cliente inválido.");
    }

    if (!Number.isFinite(desconto) || desconto < 0) {
      throw new Error("O desconto deve ser um valor igual ou maior que zero.");
    }

    if (
      !["DINHEIRO", "PIX", "CARTAO_CREDITO", "CARTAO_DEBITO"].includes(
        forma_pagamento,
      )
    ) {
      throw new Error("Forma de pagamento inválida.");
    }

    // Agrupa produtos repetidos no carrinho.
    const produtosAgrupados = new Map<number, number>();

    for (const produto of produtos) {
      if (
        !Number.isSafeInteger(produto.id_produto) ||
        produto.id_produto <= 0 ||
        !Number.isSafeInteger(produto.quantidade) ||
        produto.quantidade <= 0
      ) {
        throw new Error("Produto ou quantidade inválida.");
      }

      const quantidadeAtual =
        produtosAgrupados.get(produto.id_produto) ?? 0;

      const quantidadeTotal = quantidadeAtual + produto.quantidade;

      if (!Number.isSafeInteger(quantidadeTotal)) {
        throw new Error("Quantidade total do produto inválida.");
      }

      produtosAgrupados.set(produto.id_produto, quantidadeTotal);
    }

    // Ordena os IDs para reduzir o risco de deadlocks.
    const produtosUnicos = Array.from(
      produtosAgrupados,
      ([id_produto, quantidade]) => ({
        id_produto,
        quantidade,
      }),
    ).sort((a, b) => a.id_produto - b.id_produto);

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Verifica se o cliente existe e está ativo.
      if (id_cliente !== null) {
        const [clienteRows] = await connection.execute(
          `SELECT id_cliente, ativo
           FROM clientes
           WHERE id_cliente = ?
           FOR UPDATE`,
          [id_cliente],
        );

        const clientes = clienteRows as ClienteBanco[];
        const cliente = clientes[0];

        if (!cliente) {
          throw new Error("Cliente não encontrado.");
        }

        if (!cliente.ativo) {
          throw new Error("Não é possível realizar venda para cliente inativo.");
        }
      }

      let subtotal = 0;

      const itensCalculados: {
        id_produto: number;
        quantidade: number;
        preco_unitario: number;
        subtotal: number;
      }[] = [];

      for (const produto of produtosUnicos) {
        const [rows] = await connection.execute(
          `SELECT id_produto, preco, estoque, ativo
           FROM produtos
           WHERE id_produto = ?
           FOR UPDATE`,
          [produto.id_produto],
        );

        const encontrados = rows as ProdutoBanco[];
        const item = encontrados[0];

        if (!item) {
          throw new Error(
            `Produto ${produto.id_produto} não encontrado.`,
          );
        }

        if (!item.ativo) {
          throw new Error(
            `O produto ${produto.id_produto} está inativo.`,
          );
        }

        if (item.estoque < produto.quantidade) {
          throw new Error(
            `Estoque insuficiente para o produto ${produto.id_produto}.`,
          );
        }

        const precoUnitario = Number(item.preco);

        if (!Number.isFinite(precoUnitario) || precoUnitario <= 0) {
          throw new Error(
            `Preço inválido para o produto ${produto.id_produto}.`,
          );
        }

        const subtotalItem =
          Math.round(precoUnitario * produto.quantidade * 100) / 100;

        subtotal += subtotalItem;

        itensCalculados.push({
          id_produto: produto.id_produto,
          quantidade: produto.quantidade,
          preco_unitario: precoUnitario,
          subtotal: subtotalItem,
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;

      // Calcula o limite de desconto conforme o perfil autenticado.
      const percentualMaximo =
        tipo_usuario === "GERENTE" ? 15 : 5;

      const descontoMaximo =
        Math.round(subtotal * percentualMaximo) / 100;

      const descontoEmCentavos = Math.round(desconto * 100);
      const limiteEmCentavos = Math.round(descontoMaximo * 100);

      if (descontoEmCentavos > limiteEmCentavos) {
        throw new Error(
          `O limite máximo de desconto para ${tipo_usuario} é de ${percentualMaximo}% (R$ ${descontoMaximo.toFixed(2)}).`,
        );
      }

      if (desconto > subtotal) {
        throw new Error("O desconto não pode ser maior que o subtotal.");
      }

      const descontoFinal = descontoEmCentavos / 100;
      const total = Math.round((subtotal - descontoFinal) * 100) / 100;

      const [result] = await connection.execute(
        `INSERT INTO vendas
         (id_cliente, id_usuario, subtotal, desconto, total,
          forma_pagamento, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id_cliente,
          id_usuario,
          subtotal,
          descontoFinal,
          total,
          forma_pagamento,
          "FINALIZADA",
        ],
      );

      const vendaCriada = result as { insertId: number };
      const id_venda = vendaCriada.insertId;

      for (const item of itensCalculados) {
        await ItemVendaModel.createWithConnection(
          connection,
          id_venda,
          item.id_produto,
          item.quantidade,
          item.preco_unitario,
          item.subtotal,
        );

        const [updateResult] = await connection.execute(
          `UPDATE produtos
           SET estoque = estoque - ?
           WHERE id_produto = ?
             AND estoque >= ?`,
          [
            item.quantidade,
            item.id_produto,
            item.quantidade,
          ],
        );

        const estoqueAtualizado = updateResult as {
          affectedRows: number;
        };

        if (estoqueAtualizado.affectedRows !== 1) {
          throw new Error(
            `Não foi possível atualizar o estoque do produto ${item.id_produto}.`,
          );
        }
      }

      await connection.commit();

      return {
        id_venda,
        subtotal,
        desconto: descontoFinal,
        total,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
