export interface Produto {
  id_produto: number;
  codigo_barras: string;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  tamanho: string | null;
  cor: string | null;
  ativo: boolean;
  criado_em: Date;
}