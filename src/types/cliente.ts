
export interface Cliente {
  id_cliente: number;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  ativo: number | boolean;
  criado_em: Date;
}
