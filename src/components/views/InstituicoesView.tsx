import React, { useState, useEffect } from 'react';
import { Building, Plus, Search, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../UI';

interface InstituicoesViewProps {
  // Add props if needed
}

export const InstituicoesView: React.FC<InstituicoesViewProps> = () => {
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentInst, setCurrentInst] = useState<any>(null);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'MUNICIPAL',
    codigoInep: '',
    email: '',
    endereco: '',
    bairro: '',
    telefone: '',
    ativo: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/instituicoes');
      const data = await res.json();
      setInstituicoes(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleEdit = (inst: any) => {
    setCurrentInst(inst);
    setFormData({
      nome: inst.nome,
      tipo: inst.tipo || 'MUNICIPAL',
      codigoInep: inst.codigoInep || '',
      email: inst.email || '',
      endereco: inst.endereco || '',
      bairro: inst.bairro || '',
      telefone: inst.telefone || '',
      ativo: inst.ativo ?? true,
    });
    setIsEditing(true);
  };

  const handleNew = () => {
    setCurrentInst(null);
    setFormData({
      nome: '',
      tipo: 'MUNICIPAL',
      codigoInep: '',
      email: '',
      endereco: '',
      bairro: '',
      telefone: '',
      ativo: true,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentInst) {
        await fetch(`/api/instituicoes/${currentInst.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/instituicoes', {
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

  const filtered = instituicoes.filter(i => 
    i.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Instituições</h2>
          <p className="text-slate-500 text-sm">Gerencie as escolas e unidades da rede.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleNew}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Instituição
          </button>
        )}
      </div>

      {isEditing ? (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">
              {currentInst ? 'Editar Instituição' : 'Nova Instituição'}
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
                <label className="text-sm font-semibold">Tipo</label>
                <select 
                  value={formData.tipo} 
                  onChange={e => setFormData({...formData, tipo: e.target.value})}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="MUNICIPAL">Municipal</option>
                  <option value="ESTADUAL">Estadual</option>
                  <option value="ADMINISTRATIVO">Administrativo</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Código INEP</label>
                <input 
                  value={formData.codigoInep} 
                  onChange={e => setFormData({...formData, codigoInep: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">E-mail</label>
                <input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Endereço</label>
                <input 
                  value={formData.endereco} 
                  onChange={e => setFormData({...formData, endereco: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Bairro</label>
                <input 
                  value={formData.bairro} 
                  onChange={e => setFormData({...formData, bairro: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Telefone</label>
                <input 
                  value={formData.telefone} 
                  onChange={e => setFormData({...formData, telefone: e.target.value})}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="space-y-1 flex items-center gap-2 mt-6">
                <input 
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={e => setFormData({...formData, ativo: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="ativo" className="text-sm font-semibold cursor-pointer">Instituição Ativa</label>
              </div>
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
              placeholder="Buscar instituição..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 text-sm font-bold text-slate-500">Nome</th>
                  <th className="p-3 text-sm font-bold text-slate-500">Tipo</th>
                  <th className="p-3 text-sm font-bold text-slate-500">Status</th>
                  <th className="p-3 text-sm font-bold text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-500">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-500">Nenhuma instituição encontrada.</td></tr>
                ) : filtered.map(inst => (
                  <tr key={inst.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">{inst.nome}</td>
                    <td className="p-3 text-sm text-slate-600">{inst.tipo}</td>
                    <td className="p-3">
                      {inst.ativo ? (
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
                      <button onClick={() => handleEdit(inst)} className="text-slate-400 hover:text-brand-blue p-2 transition-colors">
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
