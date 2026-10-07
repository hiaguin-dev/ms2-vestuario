export interface Cliente {
  id_cliente: number;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  criado_em: Date;
}