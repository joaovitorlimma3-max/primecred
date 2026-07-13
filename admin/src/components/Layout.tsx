import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  FileText, 
  ListOrdered, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Clientes', path: '/clientes', icon: UserCircle },
    { name: 'Contratos', path: '/contratos', icon: FileText },
    { name: 'Parcelas', path: '/parcelas', icon: ListOrdered },
    { name: 'Caixa', path: '/caixa', icon: Wallet },
    { name: 'Relatórios', path: '/relatorios', icon: BarChart3 },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="PrimeCred Admin" style={{ height: '32px' }} />
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon />
                {item.name}
              </Link>
            );
          })}
          
          <div style={{ flex: 1 }}></div>
          
          <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', marginTop: 'auto' }}>
            <LogOut />
            Sair
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              A
            </div>
            <span style={{ fontWeight: 500 }}>Administrador</span>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
