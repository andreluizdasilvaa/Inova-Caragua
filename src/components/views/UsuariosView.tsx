import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../UI';
import { api } from '@/lib/api';

interface UsuariosViewProps {
  // Add props if needed
}

export const UsuariosView: React.FC<UsuariosViewProps> = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentUsr, setCurrentUsr] = useState<any>(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    papel: 'ESCOLA',
    instituicaoId: '',
    ativo: true,
  });

  useEffect(() => {
    fetchData();
    fetchInstituicoes();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchInstituicoes = async () => {
    try {
      const data = await api.instituicoes.list();
      setInstituicoes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (usr: any) => {
    setCurrentUsr(usr);
    setFormData({
      nome: usr.nome,
      email: usr.email,
      senha: '', // leave empty, only fill if changing
      papel: usr.papel || 'ESCOLA',
      instituicaoId: usr.instituicaoId || '',
      ativo: usr.ativo ?? true,
    });
    setIsEditing(true);
  };

  const handleNew = () => {
    setCurrentUsr(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      papel: 'ESCOLA',
      instituicaoId: '',
      ativo: true,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUsr) {
        await fetch(`/api/usuarios/${currentUsr.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = usuarios.filter(u => 
    u.nome?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Usuários</h2>
          <p className="text-slate-500 text-sm">Gerencie o acesso ao painel Mestre, Triagem e Escolas.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleNew}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        )}
      </div>

      {isEditing ? (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">
              {currentUsr ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Nome *</label>
                <input 
                  required 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Email (Login) *</label>
                <input 
                  required 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">
                  Senha {currentUsr ? '(Deixe em branco para manter)' : '*'}
                </label>
                <input 
                  type="password"
                  required={!currentUsr}
                  value={formData.senha} 
                  onChange={e => setFormData({...formData, senha: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Nível de Acesso *</label>
                <select 
                  required
                  value={formData.papel} 
                  onChange={e => {
                    const papel = e.target.value;
                    setFormData({...formData, papel, instituicaoId: papel === 'ESCOLA' ? formData.instituicaoId : ''});
                  }}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="ESCOLA">Escola (Comum)</option>
                  <option value="TRIAGEM">Triagem</option>
                  <option value="MESTRE">Mestre (Admin)</option>
                </select>
              </div>
              
              {formData.papel === 'ESCOLA' && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Instituição *</label>
                  <select 
                    required
                    value={formData.instituicaoId} 
                    onChange={e => setFormData({...formData, instituicaoId: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Selecione a instituição...</option>
                    {instituicoes.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-2 mb-4 w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 mx-2" />
            <input 
              className="bg-transparent border-none outline-none text-sm w-full" 
              placeholder="Buscar usuário..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 text-sm font-bold text-slate-500">Nome</th>
                  <th className="p-3 text-sm font-bold text-slate-500">Acesso</th>
                  <th className="p-3 text-sm font-bold text-slate-500">Instituição</th>
                  <th className="p-3 text-sm font-bold text-slate-500">Status</th>
                  <th className="p-3 text-sm font-bold text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-4 text-center text-slate-500">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
                ) : filtered.map(usr => (
                  <tr key={usr.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{usr.nome}</p>
                      <p className="text-xs text-slate-500">{usr.email}</p>
                    </td>
                    <td className="p-3 text-sm font-bold">
                      {usr.papel === 'MESTRE' ? <span className="text-purple-600">MESTRE</span> :
                       usr.papel === 'TRIAGEM' ? <span className="text-amber-600">TRIAGEM</span> :
                       <span className="text-blue-600">ESCOLA</span>}
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                      {usr.instituicao?.nome || '-'}
                    </td>
                    <td className="p-3">
                      {usr.ativo ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full w-fit">
                          <CheckCircle className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-full w-fit">
                          <XCircle className="w-3 h-3" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleEdit(usr)} className="text-slate-400 hover:text-brand-blue p-2 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
