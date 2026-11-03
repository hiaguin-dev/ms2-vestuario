"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = require("react");
require("./App.css");
function App() {
    const [produtos, setProdutos] = (0, react_1.useState)([]);
    const [carregando, setCarregando] = (0, react_1.useState)(true);
    const [erro, setErro] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        async function carregarProdutos() {
            try {
                const resposta = await fetch("http://localhost:3000/api/produtos");
                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar os produtos.");
                }
                const dados = await resposta.json();
                setProdutos(dados);
            }
            catch {
                setErro("Não foi possível conectar à API. Confira se o backend está rodando.");
            }
            finally {
                setCarregando(false);
            }
        }
        carregarProdutos();
    }, []);
    return (<main className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">MS²</span>
          <div>
            <strong>MS² Vestuário</strong>
            <small>Gestão de loja</small>
          </div>
        </div>

        <nav className="navigation">
          <a className="nav-item active" href="#inicio">Visão geral</a>
          <a className="nav-item" href="#vendas">Vendas</a>
          <a className="nav-item" href="#produtos">Produtos</a>
          <a className="nav-item" href="#clientes">Clientes</a>
          <a className="nav-item" href="#usuarios">Usuários</a>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">A</div>
          <div>
            <strong>Administrador</strong>
            <small>Gerente</small>
          </div>
        </div>
      </aside>

      <section className="dashboard-content" id="inicio">
        <header className="topbar">
          <div>
            <p className="eyebrow">PAINEL DE CONTROLE</p>
            <h1>Visão geral</h1>
            <p className="page-description">
              Acompanhe os principais dados da sua loja.
            </p>
          </div>
          <button className="primary-button" onClick={() => alert("Vamos implementar o módulo de vendas em seguida.")}>
            + Nova venda
          </button>
        </header>

        <section className="summary-grid" aria-label="Resumo da loja">
          <article className="summary-card">
            <span>Vendas de hoje</span>
            <strong>R$ 1.249,70</strong>
            <small className="positive">Dado demonstrativo</small>
          </article>
          <article className="summary-card">
            <span>Vendas realizadas</span>
            <strong>18</strong>
            <small>Dado demonstrativo</small>
          </article>
          <article className="summary-card">
            <span>Produtos cadastrados</span>
            <strong>{produtos.length}</strong>
            <small>Carregados da API</small>
          </article>
          <article className="summary-card">
            <span>Estoque baixo</span>
            <strong>{produtos.filter((produto) => produto.estoque <= 5).length}</strong>
            <small className="warning">Até 5 unidades</small>
          </article>
        </section>

        <section className="content-panel" id="produtos">
          <div className="panel-heading">
            <div>
              <h2>Produtos cadastrados</h2>
              <p>Dados carregados do banco pela API</p>
            </div>
          </div>

          {carregando ? (<p className="status-message">Carregando produtos...</p>) : erro ? (<p className="status-message error">{erro}</p>) : produtos.length === 0 ? (<p className="status-message">Nenhum produto cadastrado.</p>) : (<div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Código de barras</th>
                    <th>Estoque</th>
                    <th>Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (<tr key={produto.id_produto}>
                      <td>{produto.nome}</td>
                      <td>{produto.codigo_barras}</td>
                      <td>
                        <span className={produto.estoque <= 5 ? "stock low" : "stock"}>
                          {produto.estoque} un.
                        </span>
                      </td>
                      <td>
                        {Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                })}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
        </section>

        <footer className="dashboard-footer">
          MS² Vestuário <span>•</span> Sistema de vendas e estoque
        </footer>
      </section>
    </main>);
}
