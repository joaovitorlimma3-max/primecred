import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserCheck, FileSignature, AlertCircle, DollarSign, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    leadsHoje: 0,
    leadsSemana: 0,
    clientesAtivos: 0,
    contratosAtivos: 0,
    valorEmprestado: 0,
    parcelasVencidas: 0
  });

  useEffect(() => {
    async function loadStats() {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());

      const { count: countHoje } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hoje.toISOString());

      const { count: countSemana } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', inicioSemana.toISOString());

      setStats(prev => ({
        ...prev,
        leadsHoje: countHoje || 0,
        leadsSemana: countSemana || 0
      }));
    }

    loadStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Dashboard</h2>
      
      <div className="grid-cards">
        <div className="card stat-card">
          <div className="stat-icon"><Users /></div>
          <div className="stat-info">
            <p>Leads de Hoje</p>
            <h3>{stats.leadsHoje}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><Clock /></div>
          <div className="stat-info">
            <p>Leads da Semana</p>
            <h3>{stats.leadsSemana}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><UserCheck /></div>
          <div className="stat-info">
            <p>Clientes Ativos</p>
            <h3>{stats.clientesAtivos}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon"><FileSignature /></div>
          <div className="stat-info">
            <p>Contratos Ativos</p>
            <h3>{stats.contratosAtivos}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}><DollarSign /></div>
          <div className="stat-info">
            <p>Valor Emprestado</p>
            <h3>{formatCurrency(stats.valorEmprestado)}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}><AlertCircle /></div>
          <div className="stat-info">
            <p>Parcelas Vencidas</p>
            <h3>{stats.parcelasVencidas}</h3>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3>Atividade Recente</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Em breve: gráfico de aprovações e painel de tarefas diárias.</p>
      </div>
    </div>
  );
}
