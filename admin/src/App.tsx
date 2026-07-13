import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';

function App() {
  return (
    <Router basename="/admin">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            
            {/* Future Routes */}
            <Route path="/clientes" element={<div className="content-area"><h2>Clientes</h2><p>Módulo em desenvolvimento...</p></div>} />
            <Route path="/contratos" element={<div className="content-area"><h2>Contratos</h2><p>Módulo em desenvolvimento...</p></div>} />
            <Route path="/parcelas" element={<div className="content-area"><h2>Parcelas</h2><p>Módulo em desenvolvimento...</p></div>} />
            <Route path="/caixa" element={<div className="content-area"><h2>Caixa</h2><p>Módulo em desenvolvimento...</p></div>} />
            <Route path="/relatorios" element={<div className="content-area"><h2>Relatórios</h2><p>Módulo em desenvolvimento...</p></div>} />
            <Route path="/configuracoes" element={<div className="content-area"><h2>Configurações</h2><p>Módulo em desenvolvimento...</p></div>} />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
