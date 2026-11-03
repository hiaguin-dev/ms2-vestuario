
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api";

interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  tipo: "CAIXA" | "GERENTE";
}

interface Produto {
  id_produto: number;
  codigo_barras: string;
  nome: string;
  descricao?: string | null;
  preco: number | string;
  estoque: number;
  tamanho?: string | null;
  cor?: string | null;
  ativo: boolean | number;
}

interface ProdutoFormulario {
  codigo_barras: string;
  nome: string;
  descricao: string;
  preco: string;
  estoque: string;
  tamanho: string;
  cor: string;
}

const formularioProdutoVazio: ProdutoFormulario = {
  codigo_barras: "",
  nome: "",
  descricao: "",
  preco: "",
  estoque: "0",
  tamanho: "",
  cor: "",
};

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

interface Venda {
  id_venda: number;
  id_cliente: number | null;
  id_usuario: number;
  data_venda: string;
  subtotal: number | string;
  desconto: number | string;
  total: number | string;
  forma_pagamento: string;
  status: string;
}

interface ItemVenda {
  id_item: number;
  id_venda: number;
  id_produto: number;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number | string;
  subtotal: number | string;
}

interface VendaDetalhada extends Venda {
  itens: ItemVenda[];
}

type Pagina = "dashboard" | "vendas" | "produtos" | "historico";

function formatarMoeda(valor: number | string) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function nomeFormaPagamento(forma: string) {
  const formas: Record<string, string> = {
    DINHEIRO: "Dinheiro",
    PIX: "PIX",
    CARTAO_CREDITO: "Cartão de crédito",
    CARTAO_DEBITO: "Cartão de débito",
  };

  return formas[forma] ?? forma;
}

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<number | null>(null);
  const [formularioProduto, setFormularioProduto] =
    useState<ProdutoFormulario>(formularioProdutoVazio);
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [desconto, setDesconto] = useState("0");

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendaSelecionada, setVendaSelecionada] =
    useState<VendaDetalhada | null>(null);

  const [pagina, setPagina] = useState<Pagina>("dashboard");

  const [carregando, setCarregando] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarProdutos() {
    const resposta = await fetch(`${API_URL}/produtos`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    const dados: Produto[] = await resposta.json();

    // Mantém ativos e inativos para permitir reativação na tela de produtos.
    setProdutos(dados);
  }

  async function carregarHistorico() {
    if (!token) return;

    setCarregandoHistorico(true);

    try {
      const resposta = await fetch(`${API_URL}/vendas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao carregar o histórico.");
      }

      setVendas(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar o histórico de vendas.",
      );
    } finally {
      setCarregandoHistorico(false);
    }
  }

  async function visualizarVenda(id: number) {
    setErro("");
    setVendaSelecionada(null);
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/vendas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível consultar a venda.",
        );
      }

      setVendaSelecionada(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao consultar os detalhes da venda.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (usuario && token) {
      carregarProdutos().catch(() => {
        setErro("Não foi possível carregar os produtos da API.");
      });

      carregarHistorico();
    }
  }, [usuario, token]);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível realizar o login.",
        );
      }

      setToken(dados.token);
      setUsuario(dados.usuario);
      setSenha("");
      setPagina("dashboard");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao conectar com a API.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function sair() {
    setUsuario(null);
    setToken("");
    setCarrinho([]);
    setVendas([]);
    setProdutos([]);
    setVendaSelecionada(null);
    setPagina("dashboard");
    setErro("");
    setMensagem("");
  }

  function adicionarAoCarrinho() {
    setErro("");
    setMensagem("");

    const id = Number(produtoSelecionado);
    const qtd = Number(quantidade);
    const produto = produtos.find((item) => item.id_produto === id);

    if (!produto || !Number.isInteger(qtd) || qtd <= 0) {
      setErro("Selecione um produto e informe uma quantidade válida.");
      return;
    }

    const quantidadeNoCarrinho =
      carrinho.find((item) => item.produto.id_produto === id)?.quantidade ?? 0;

    if (quantidadeNoCarrinho + qtd > produto.estoque) {
      setErro("A quantidade solicitada é maior que o estoque disponível.");
      return;
    }

    setCarrinho((atual) => {
      const existente = atual.find(
        (item) => item.produto.id_produto === id,
      );

      if (existente) {
        return atual.map((item) =>
          item.produto.id_produto === id
            ? { ...item, quantidade: item.quantidade + qtd }
            : item,
        );
      }

      return [...atual, { produto, quantidade: qtd }];
    });

    setProdutoSelecionado("");
    setQuantidade("1");
  }

  function removerDoCarrinho(idProduto: number) {
    setCarrinho((atual) =>
      atual.filter((item) => item.produto.id_produto !== idProduto),
    );
  }

  const subtotal = carrinho.reduce(
    (total, item) => total + Number(item.produto.preco) * item.quantidade,
    0,
  );

  const valorDesconto = Number(desconto);

  const total =
    subtotal - (Number.isFinite(valorDesconto) ? valorDesconto : 0);

  // INDICADORES DA VISÃO GERAL

  const vendasFinalizadas = vendas.filter(
    (venda) => venda.status === "FINALIZADA",
  );

  const faturamentoTotal = vendasFinalizadas.reduce(
    (acumulado, venda) => acumulado + Number(venda.total),
    0,
  );

  const quantidadeVendas = vendasFinalizadas.length;

  const ticketMedio =
    quantidadeVendas > 0 ? faturamentoTotal / quantidadeVendas : 0;

  const produtosAtivos = produtos.filter((produto) => Boolean(produto.ativo));

  const produtosEstoqueBaixo = produtosAtivos.filter(
    (produto) => produto.estoque <= 5,
  );

  async function finalizarVenda() {
    setErro("");
    setMensagem("");

    if (carrinho.length === 0) {
      setErro("Adicione pelo menos um produto ao carrinho.");
      return;
    }

    if (
      !Number.isFinite(valorDesconto) ||
      valorDesconto < 0 ||
      valorDesconto > subtotal
    ) {
      setErro("Informe um desconto válido, que não ultrapasse o subtotal.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/vendas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_cliente: null,
          produtos: carrinho.map((item) => ({
            id_produto: item.produto.id_produto,
            quantidade: item.quantidade,
          })),
          desconto: valorDesconto,
          forma_pagamento: formaPagamento,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível registrar a venda.",
        );
      }

      setMensagem(
        `Venda #${dados.venda.id_venda} registrada! Total: ${formatarMoeda(
          dados.venda.total,
        )}`,
      );

      setCarrinho([]);
      setDesconto("0");

      await carregarProdutos();
      await carregarHistorico();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao registrar venda.",
      );
    } finally {
      setCarregando(false);
    }
  }

  async function salvarProduto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    const preco = Number(formularioProduto.preco);
    const estoque = Number(formularioProduto.estoque);

    if (!Number.isFinite(preco) || preco <= 0) {
      setErro("Informe um preço válido.");
      return;
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
      setErro("Informe um estoque válido.");
      return;
    }

    setCarregando(true);

    try {
      const editando = produtoEmEdicao !== null;
      const resposta = await fetch(
        editando
          ? `${API_URL}/produtos/${produtoEmEdicao}`
          : `${API_URL}/produtos`,
        {
          method: editando ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codigo_barras: formularioProduto.codigo_barras.trim(),
            nome: formularioProduto.nome.trim(),
            descricao: formularioProduto.descricao.trim() || null,
            preco,
            estoque,
            tamanho: formularioProduto.tamanho.trim() || null,
            cor: formularioProduto.cor.trim() || null,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível salvar o produto.");
      }

      setMensagem(
        editando
          ? "Produto atualizado com sucesso."
          : "Produto cadastrado com sucesso.",
      );
      setFormularioProduto(formularioProdutoVazio);
      setProdutoEmEdicao(null);
      setFormularioAberto(false);
      await carregarProdutos();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao salvar produto.",
      );
    } finally {
      setCarregando(false);
    }
  }

  async function alterarStatusProduto(produto: Produto) {
    setErro("");
    setMensagem("");

    const novoStatus = !Boolean(produto.ativo);
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/produtos/${produto.id_produto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_barras: produto.codigo_barras,
          nome: produto.nome,
          descricao: produto.descricao ?? null,
          preco: Number(produto.preco),
          estoque: Number(produto.estoque),
          tamanho: produto.tamanho ?? null,
          cor: produto.cor ?? null,
          ativo: novoStatus,
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível alterar o status do produto.");
      }

      setMensagem(novoStatus ? "Produto reativado com sucesso." : "Produto desativado com sucesso.");
      await carregarProdutos();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao alterar o status do produto.");
    } finally {
      setCarregando(false);
    }
  }

  if (!usuario) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand">
            <span className="brand-mark">MS²</span>
            <div>
              <h1>MS² Vestuário</h1>
              <p>Sistema de vendas e estoque</p>
            </div>
          </div>

          <div className="welcome">
            <h2>Acesse o sistema</h2>
            <p>Entre com seu usuário cadastrado.</p>
          </div>

          <form onSubmit={entrar}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
            />

            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Sua senha"
              required
            />

            {erro && <p className="status-message error">{erro}</p>}

            <button type="submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar no sistema"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">MS²</span>
          <div>
            <strong>MS² Vestuário</strong>
            <small>Gestão de loja</small>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${pagina === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setPagina("dashboard");
              setVendaSelecionada(null);
            }}
          >
            Visão geral
          </button>

          <button
            className={`nav-item ${pagina === "vendas" ? "active" : ""}`}
            onClick={() => {
              setPagina("vendas");
              setVendaSelecionada(null);
            }}
          >
            Nova venda
          </button>

          <button
            className={`nav-item ${pagina === "produtos" ? "active" : ""}`}
            onClick={() => {
              setPagina("produtos");
              setVendaSelecionada(null);
            }}
          >
            Produtos
          </button>

          <button
            className={`nav-item ${pagina === "historico" ? "active" : ""}`}
            onClick={() => {
              setPagina("historico");
              setVendaSelecionada(null);
              carregarHistorico();
            }}
          >
            Histórico de vendas
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{usuario.nome}</strong>
            <small>{usuario.tipo}</small>
          </div>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MS² VESTUÁRIO</p>

            <h1>
              {pagina === "dashboard"
                ? "Visão geral"
                : pagina === "vendas"
                  ? "PDV — Nova venda"
                  : pagina === "produtos"
                    ? "Produtos e estoque"
                    : "Histórico de vendas"}
            </h1>

            <p className="page-description">
              {pagina === "dashboard"
                ? "Acompanhe os resultados e a situação da sua loja."
                : pagina === "vendas"
                  ? "Selecione os produtos e finalize a venda."
                  : pagina === "produtos"
                    ? "Consulte os produtos disponíveis no estoque."
                    : "Consulte as vendas realizadas no sistema."}
            </p>
          </div>

          <button className="secondary-button" onClick={sair}>
            Sair
          </button>
        </header>

        {erro && <p className="status-message error">{erro}</p>}
        {mensagem && <p className="status-message success">{mensagem}</p>}

        {/* VISÃO GERAL */}

        {pagina === "dashboard" && (
          <>
            <section className="summary-grid">
              <article className="summary-card">
                <span>Faturamento total</span>
                <strong>{formatarMoeda(faturamentoTotal)}</strong>
                <small>Vendas finalizadas</small>
              </article>

              <article className="summary-card">
                <span>Vendas realizadas</span>
                <strong>{quantidadeVendas}</strong>
                <small>Vendas finalizadas</small>
              </article>

              <article className="summary-card">
                <span>Ticket médio</span>
                <strong>{formatarMoeda(ticketMedio)}</strong>
                <small>Valor médio por venda</small>
              </article>

              <article className="summary-card">
                <span>Produtos cadastrados</span>
                <strong>{produtosAtivos.length}</strong>
                <small>Produtos ativos</small>
              </article>
            </section>

            <section className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>Produtos com estoque baixo</h2>
                  <p>
                    {produtosEstoqueBaixo.length} produto(s) com 5 unidades ou
                    menos
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => setPagina("produtos")}
                >
                  Ver todos os produtos
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Código de barras</th>
                      <th>Estoque atual</th>
                      <th>Preço</th>
                    </tr>
                  </thead>

                  <tbody>
                    {produtosEstoqueBaixo.map((produto) => (
                      <tr key={produto.id_produto}>
                        <td>{produto.nome}</td>
                        <td>{produto.codigo_barras}</td>
                        <td>
                          <span className="stock low">
                            {produto.estoque} un.
                          </span>
                        </td>
                        <td>{formatarMoeda(produto.preco)}</td>
                      </tr>
                    ))}

                    {produtosEstoqueBaixo.length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          Nenhum produto com estoque baixo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>Últimas vendas</h2>
                  <p>As cinco vendas mais recentes</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => {
                    setPagina("historico");
                    carregarHistorico();
                  }}
                >
                  Ver histórico completo
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Venda</th>
                      <th>Data</th>
                      <th>Pagamento</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendas.slice(0, 5).map((venda) => (
                      <tr key={venda.id_venda}>
                        <td>#{venda.id_venda}</td>
                        <td>{formatarData(venda.data_venda)}</td>
                        <td>{nomeFormaPagamento(venda.forma_pagamento)}</td>
                        <td>{venda.status}</td>
                        <td>{formatarMoeda(venda.total)}</td>
                      </tr>
                    ))}

                    {vendas.length === 0 && (
                      <tr>
                        <td colSpan={5}>Nenhuma venda registrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* NOVA VENDA */}

        {pagina === "vendas" && (
          <>
            <section className="content-panel" id="vendas">
              <div className="panel-heading">
                <div>
                  <h2>Adicionar produto</h2>
                  <p>Produtos disponíveis no estoque</p>
                </div>
              </div>

              <div className="sale-form">
                <label htmlFor="produto">Produto</label>
                <select
                  id="produto"
                  value={produtoSelecionado}
                  onChange={(event) =>
                    setProdutoSelecionado(event.target.value)
                  }
                >
                  <option value="">Selecione um produto</option>

                  {produtosAtivos.map((produto) => (
                    <option
                      key={produto.id_produto}
                      value={produto.id_produto}
                    >
                      {produto.nome} — {formatarMoeda(produto.preco)} — estoque:{" "}
                      {produto.estoque}
                    </option>
                  ))}
                </select>

                <label htmlFor="quantidade">Quantidade</label>
                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(event) => setQuantidade(event.target.value)}
                />

                <button
                  className="primary-button"
                  onClick={adicionarAoCarrinho}
                >
                  Adicionar ao carrinho
                </button>
              </div>
            </section>

            <section className="content-panel sale-cart">
              <div className="panel-heading">
                <div>
                  <h2>Carrinho</h2>
                  <p>{carrinho.length} item(ns)</p>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {carrinho.map((item) => (
                      <tr key={item.produto.id_produto}>
                        <td>{item.produto.nome}</td>
                        <td>{item.quantidade}</td>
                        <td>
                          {formatarMoeda(
                            Number(item.produto.preco) * item.quantidade,
                          )}
                        </td>
                        <td>
                          <button
                            className="secondary-button"
                            onClick={() =>
                              removerDoCarrinho(item.produto.id_produto)
                            }
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}

                    {carrinho.length === 0 && (
                      <tr>
                        <td colSpan={4}>Nenhum produto no carrinho.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="sale-checkout">
                <label htmlFor="pagamento">Forma de pagamento</label>
                <select
                  id="pagamento"
                  value={formaPagamento}
                  onChange={(event) => setFormaPagamento(event.target.value)}
                >
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de débito</option>
                </select>

                <label htmlFor="desconto">Desconto (R$)</label>
                <input
                  id="desconto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={desconto}
                  onChange={(event) => setDesconto(event.target.value)}
                />

                <div className="sale-total">
                  <span>Subtotal</span>
                  <strong>{formatarMoeda(subtotal)}</strong>
                  <span>Total</span>
                  <strong>{formatarMoeda(total)}</strong>
                </div>

                <button
                  className="primary-button"
                  onClick={finalizarVenda}
                  disabled={carregando || carrinho.length === 0}
                >
                  {carregando ? "Registrando..." : "Finalizar venda"}
                </button>
              </div>
            </section>
          </>
        )}

        {/* PRODUTOS */}

        {pagina === "produtos" && (
          <section className="content-panel" id="produtos">
            <div className="panel-heading">
              <div>
                <h2>Gerenciamento de produtos</h2>
                <p>{produtosAtivos.length} produto(s) ativo(s) · {produtos.length - produtosAtivos.length} inativo(s)</p>
              </div>

              <button
                className="primary-button"
                onClick={() => {
                  setProdutoEmEdicao(null);
                  setFormularioProduto(formularioProdutoVazio);
                  setFormularioAberto((aberto) => !aberto);
                  setErro("");
                  setMensagem("");
                }}
              >
                {formularioAberto ? "Fechar formulário" : "Novo produto"}
              </button>
            </div>

            {formularioAberto && (
              <form className="sale-form" onSubmit={salvarProduto}>
                <h3>{produtoEmEdicao !== null ? "Editar produto" : "Cadastrar produto"}</h3>

                <label htmlFor="codigo_barras">Código de barras</label>
                <input
                  id="codigo_barras"
                  value={formularioProduto.codigo_barras}
                  onChange={(event) =>
                    setFormularioProduto({
                      ...formularioProduto,
                      codigo_barras: event.target.value,
                    })
                  }
                  required
                />

                <label htmlFor="nome_produto">Nome do produto</label>
                <input
                  id="nome_produto"
                  value={formularioProduto.nome}
                  onChange={(event) =>
                    setFormularioProduto({
                      ...formularioProduto,
                      nome: event.target.value,
                    })
                  }
                  required
                />

                <label htmlFor="descricao_produto">Descrição</label>
                <input
                  id="descricao_produto"
                  value={formularioProduto.descricao}
                  onChange={(event) =>
                    setFormularioProduto({
                      ...formularioProduto,
                      descricao: event.target.value,
                    })
                  }
                />

                <label htmlFor="preco_produto">Preço (R$)</label>
                <input
                  id="preco_produto"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formularioProduto.preco}
                  onChange={(event) =>
                    setFormularioProduto({
                      ...formularioProduto,
                      preco: event.target.value,
                    })
                  }
                  required
                />

                <label htmlFor="estoque_produto">Estoque</label>
                <input
                  id="estoque_produto"
                  type="number"
                  min="0"
                  step="1"
                  value={formularioProduto.estoque}
                  onChange={(event) =>
                    setFormularioProduto({
                      ...formularioProduto,
                      estoque: event.target.value,
                    })
                  }
                  required
                />

                <label htmlFor="tamanho_produto">Tamanho</label>
                <input
                  id="tamanho_produto"
                  value={formularioProduto.tamanho}
                  onChange={(event) =>
                    setFormularioProduto({
                      ...formularioProduto,
                      tamanho: event.target.value,
                    })
                  }
                  placeholder="Ex.: P, M, G, GG"
                />

                <label htmlFor="cor_produto">Cor</label>
                <input
                  id="cor_produto"
                  value={formularioProduto.cor}
                  onChange={(event) =>
                    setFormularioProduto({
                      ...formularioProduto,
                      cor: event.target.value,
                    })
                  }
                  placeholder="Ex.: Preto"
                />

                <button
                  className="primary-button"
                  type="submit"
                  disabled={carregando}
                >
                  {carregando
                    ? "Salvando..."
                    : produtoEmEdicao !== null
                      ? "Salvar alterações"
                      : "Cadastrar produto"}
                </button>
              </form>
            )}

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Código de barras</th>
                    <th>Estoque</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id_produto}>
                      <td>{produto.nome}</td>
                      <td>{produto.codigo_barras}</td>
                      <td>{produto.estoque} un.</td>
                      <td>{formatarMoeda(produto.preco)}</td>
                      <td>
                        <span className={`stock ${Boolean(produto.ativo) ? "" : "low"}`}>
                          {Boolean(produto.ativo) ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setProdutoEmEdicao(produto.id_produto);
                            setFormularioProduto({
                              codigo_barras: produto.codigo_barras,
                              nome: produto.nome,
                              descricao: produto.descricao ?? "",
                              preco: String(produto.preco),
                              estoque: String(produto.estoque),
                              tamanho: produto.tamanho ?? "",
                              cor: produto.cor ?? "",
                            });
                            setFormularioAberto(true);
                            setErro("");
                            setMensagem("");
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="secondary-button"
                          onClick={() => alterarStatusProduto(produto)}
                          disabled={carregando}
                        >
                          {Boolean(produto.ativo) ? "Desativar" : "Reativar"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {produtos.length === 0 && (
                    <tr>
                      <td colSpan={6}>Nenhum produto cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* HISTÓRICO DE VENDAS */}

        {pagina === "historico" && (
          <>
            <section className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>Vendas realizadas</h2>
                  <p>{vendas.length} venda(s) registrada(s)</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={carregarHistorico}
                  disabled={carregandoHistorico}
                >
                  {carregandoHistorico ? "Atualizando..." : "Atualizar"}
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Venda</th>
                      <th>Data</th>
                      <th>Pagamento</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Detalhes</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendas.map((venda) => (
                      <tr key={venda.id_venda}>
                        <td>#{venda.id_venda}</td>
                        <td>{formatarData(venda.data_venda)}</td>
                        <td>{nomeFormaPagamento(venda.forma_pagamento)}</td>
                        <td>{venda.status}</td>
                        <td>{formatarMoeda(venda.total)}</td>
                        <td>
                          <button
                            className="secondary-button"
                            onClick={() => visualizarVenda(venda.id_venda)}
                            disabled={carregando}
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!carregandoHistorico && vendas.length === 0 && (
                      <tr>
                        <td colSpan={6}>Nenhuma venda registrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {vendaSelecionada && (
              <section className="content-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Detalhes da venda #{vendaSelecionada.id_venda}</h2>
                    <p>{formatarData(vendaSelecionada.data_venda)}</p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => setVendaSelecionada(null)}
                  >
                    Fechar detalhes
                  </button>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Preço unitário</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {vendaSelecionada.itens.map((item) => (
                        <tr key={item.id_item}>
                          <td>{item.nome_produto}</td>
                          <td>{item.quantidade}</td>
                          <td>{formatarMoeda(item.preco_unitario)}</td>
                          <td>{formatarMoeda(item.subtotal)}</td>
                        </tr>
                      ))}

                      {vendaSelecionada.itens.length === 0 && (
                        <tr>
                          <td colSpan={4}>Nenhum item encontrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="sale-total">
                  <span>Subtotal</span>
                  <strong>{formatarMoeda(vendaSelecionada.subtotal)}</strong>

                  <span>Desconto</span>
                  <strong>{formatarMoeda(vendaSelecionada.desconto)}</strong>

                  <span>Forma de pagamento</span>
                  <strong>
                    {nomeFormaPagamento(vendaSelecionada.forma_pagamento)}
                  </strong>

                  <span>Total da venda</span>
                  <strong>{formatarMoeda(vendaSelecionada.total)}</strong>
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
