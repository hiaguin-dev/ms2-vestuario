export type FormaPagamento =
  | "DINHEIRO"
  | "PIX"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO";

export type StatusVenda = "FINALIZADA" | "CANCELADA";

export interface Venda {
  id_venda: number;
  id_cliente: number | null;
  id_usuario: number;
  data_venda: Date;
  subtotal: number;
  desconto: number;
  total: number;
  forma_pagamento: FormaPagamento;
  status: StatusVenda;
}