export default function AdminDashboard() {
  return (
    <div className="container">
      <aside className="sidebar">
        <div className="logo">LoopClub</div>
        <nav className="nav">
          <span>Dashboard</span>
          <span>Empresas</span>
          <span>Assinaturas</span>
          <span>Planos</span>
          <span>Relatórios</span>
          <span>Configurações</span>
        </nav>
      </aside>
      <main className="main">
        <div className="header">
          <div>
            <h1>Dashboard Admin</h1>
            <p>Visão executiva do LoopClub SaaS v1.0</p>
          </div>
          <button className="button">Nova empresa</button>
        </div>
        <section className="cards">
          <div className="card"><span>MRR previsto</span><strong>R$ 0</strong></div>
          <div className="card"><span>Empresas ativas</span><strong>0</strong></div>
          <div className="card"><span>Empresas teste</span><strong>0</strong></div>
          <div className="card"><span>Bloqueadas</span><strong>0</strong></div>
        </section>
        <section className="panel">
          <h2>Empresas recentes</h2>
          <table className="table">
            <thead><tr><th>Empresa</th><th>Categoria</th><th>Status</th><th>Plano</th></tr></thead>
            <tbody>
              <tr><td>Açaí Modelo</td><td>Açaí</td><td><span className="badge">Ativa</span></td><td>Pro</td></tr>
              <tr><td>Barbearia Prime</td><td>Barbearia</td><td><span className="badge">Teste</span></td><td>Basic</td></tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
