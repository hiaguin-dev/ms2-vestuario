export type TipoUsuario = "CAIXA" | "GERENTE";

export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  ativo: boolean;
  criado_em: Date;
}