import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MessageCircle, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLead();
  }, [id]);

  async function loadLead() {
    if (!id) return;
    const { data } = await supabase.from('leads').select('*').eq('id', id).single();
    setLead(data);
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    if (!lead) return;
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id);
    if (!error) {
      setLead({ ...lead, status: newStatus });
    } else {
      alert('Erro ao atualizar status');
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', lead?.id);
    if (!error) {
      navigate('/leads');
    } else {
      alert('Erro ao excluir');
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const openWhatsApp = () => {
    if (!lead?.telefone) return;
    const phone = lead.telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${lead.nome}, sou especialista da PrimeCred e estou entrando em contato sobre sua pré-solicitação de crédito.`);
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>;
  if (!lead) return <div style={{ padding: '40px', textAlign: 'center' }}>Lead não encontrado.</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/leads')} className="btn btn-outline" style={{ padding: '8px', border: 'none' }}>
          <ArrowLeft />
        </button>
        <h2 style={{ margin: 0 }}>Detalhes do Lead</h2>
        <span className={`status-badge status-${lead.status.toLowerCase().replace(' ', '')}`} style={{ marginLeft: 'auto', fontSize: '0.875rem', padding: '6px 12px' }}>
          {lead.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={openWhatsApp} className="btn" style={{ backgroundColor: '#25D366', color: 'white' }}>
          <MessageCircle size={18} /> Abrir WhatsApp
        </button>
        <button className="btn btn-outline">
          <Edit size={18} /> Editar
        </button>
        <button onClick={handleDelete} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          <Trash2 size={18} /> Excluir
        </button>

        <div style={{ flex: 1 }}></div>

        <button onClick={() => updateStatus('Em análise')} className="btn btn-outline" style={{ color: '#92400E', borderColor: '#FEF3C7', backgroundColor: '#FEF3C7' }}>
          <Clock size={18} /> Em Análise
        </button>
        <button onClick={() => updateStatus('Aprovado')} className="btn btn-outline" style={{ color: '#065F46', borderColor: '#D1FAE5', backgroundColor: '#D1FAE5' }}>
          <CheckCircle size={18} /> Aprovar
        </button>
        <button onClick={() => updateStatus('Reprovado')} className="btn btn-outline" style={{ color: '#991B1B', borderColor: '#FEE2E2', backgroundColor: '#FEE2E2' }}>
          <XCircle size={18} /> Reprovar
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Informações Pessoais</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Nome Completo</p>
            <p style={{ fontWeight: 500 }}>{lead.nome}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Telefone / WhatsApp</p>
            <p style={{ fontWeight: 500 }}>{lead.telefone}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>CPF</p>
            <p style={{ fontWeight: 500 }}>{lead.cpf}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Cidade / UF</p>
            <p style={{ fontWeight: 500 }}>{lead.cidade} - {lead.uf}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Bairro</p>
            <p style={{ fontWeight: 500 }}>{lead.bairro}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Data do Cadastro</p>
            <p style={{ fontWeight: 500 }}>{new Date(lead.created_at).toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <h3 style={{ marginBottom: '24px', marginTop: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Perfil Financeiro</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Valor Solicitado</p>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--primary-color)' }}>{formatCurrency(lead.valor_solicitado)}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Renda Mensal</p>
            <p style={{ fontWeight: 500 }}>{formatCurrency(lead.renda_mensal)}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Observações (Respostas do Formulário)</p>
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
              <p style={{ lineHeight: '1.6' }}>{lead.observacoes || 'Nenhuma observação extra.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
