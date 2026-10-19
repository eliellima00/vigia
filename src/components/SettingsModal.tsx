import React, { useState } from 'react';
import { X, Sliders, Building2, Users, Database, RotateCcw, Save, Plus } from 'lucide-react';
import { AlertThresholds, UBS, UserOperator } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: AlertThresholds;
  onSaveThresholds: (thresholds: AlertThresholds) => void;
  ubsList: UBS[];
  onAddUbs: (ubs: Omit<UBS, 'id'>) => void;
  operators: UserOperator[];
  onAddOperator: (operator: Omit<UserOperator, 'id'>) => void;
  onResetDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSaveThresholds,
  ubsList,
  onAddUbs,
  operators,
  onAddOperator,
  onResetDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'faixas' | 'ubs' | 'operadores' | 'backup'>('faixas');

  // Form states for thresholds
  const [highDays, setHighDays] = useState(thresholds.highPriorityDays);
  const [attentionDays, setAttentionDays] = useState(thresholds.attentionDays);
  const [monitoringDays, setMonitoringDays] = useState(thresholds.monitoringDays);

  // New UBS state
  const [newUbsName, setNewUbsName] = useState('');
  const [newUbsCnes, setNewUbsCnes] = useState('');
  const [newUbsDistrict, setNewUbsDistrict] = useState('');
  const [newUbsCity, setNewUbsCity] = useState('São Paulo - SP');

  // New Operator state
  const [newOpName, setNewOpName] = useState('');
  const [newOpRole, setNewOpRole] = useState('Farmacêutico(a)');
  const [newOpReg, setNewOpReg] = useState('');

  if (!isOpen) return null;

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThresholds({
      highPriorityDays: Number(highDays),
      attentionDays: Number(attentionDays),
      monitoringDays: Number(monitoringDays),
    });
    alert('Faixas de alerta atualizadas com sucesso!');
  };

  const handleCreateUbs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUbsName || !newUbsCnes) return;
    onAddUbs({
      name: newUbsName,
      cnes: newUbsCnes,
      district: newUbsDistrict || 'Distrito de Saúde',
      city: newUbsCity || 'Município',
    });
    setNewUbsName('');
    setNewUbsCnes('');
    setNewUbsDistrict('');
    alert('Nova Unidade Básica de Saúde cadastrada!');
  };

  const handleCreateOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName) return;
    onAddOperator({
      name: newOpName,
      role: newOpRole,
      registration: newOpReg || 'Não informado',
    });
    setNewOpName('');
    setNewOpReg('');
    alert('Novo profissional cadastrado com sucesso!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Configurações do Sistema VIGIA
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Parâmetros de alerta, expansão para rede multi-UBS e controle de acessos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center border-b border-slate-200 px-6 gap-6 text-xs font-medium text-slate-600 bg-white">
          <button
            onClick={() => setActiveTab('faixas')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'faixas'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Faixas de Alerta</span>
          </button>

          <button
            onClick={() => setActiveTab('ubs')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ubs'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Rede de UBS</span>
          </button>

          <button
            onClick={() => setActiveTab('operadores')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'operadores'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Profissionais & Operadores</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Banco & Restauração</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs">
          
          {/* TAB 1: FAIXAS DE ALERTA */}
          {activeTab === 'faixas' && (
            <form onSubmit={handleSaveThresholds} className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Configuração de Parâmetros de Vencimento
                </h3>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Defina os limites em dias para cada faixa de criticidade. Produtos com validade dentro de cada faixa serão sinalizados no painel e nos relatórios técnicos.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                  <label className="block font-semibold text-amber-900 mb-1">
                    Faixa de Prioridade Alta (dias):
                  </label>
                  <p className="text-amber-700 text-[11px] mb-2">
                    Lotes que devem ser dispensados imediatamente ou remanejados para evitar vencimento.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">De 1 até</span>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={highDays}
                      onChange={(e) => setHighDays(Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono font-semibold"
                      required
                    />
                    <span className="text-slate-500">dias</span>
                  </div>
                </div>

                <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-lg">
                  <label className="block font-semibold text-orange-900 mb-1">
                    Faixa de Atenção (dias):
                  </label>
                  <p className="text-orange-700 text-[11px] mb-2">
                    Lotes sob acompanhamento de rotatividade.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">De {Number(highDays) + 1} até</span>
                    <input
                      type="number"
                      min={Number(highDays) + 1}
                      max="120"
                      value={attentionDays}
                      onChange={(e) => setAttentionDays(Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono font-semibold"
                      required
                    />
                    <span className="text-slate-500">dias</span>
                  </div>
                </div>

                <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-lg">
                  <label className="block font-semibold text-teal-900 mb-1">
                    Faixa de Monitoramento (dias):
                  </label>
                  <p className="text-teal-700 text-[11px] mb-2">
                    Lotes em situação estável com controle preventivo.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">De {Number(attentionDays) + 1} até</span>
                    <input
                      type="number"
                      min={Number(attentionDays) + 1}
                      max="180"
                      value={monitoringDays}
                      onChange={(e) => setMonitoringDays(Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono font-semibold"
                      required
                    />
                    <span className="text-slate-500">dias</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-medium shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Parâmetros de Alerta</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REDE DE UBS */}
          {activeTab === 'ubs' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Estrutura Multi-UBS para Municípios
                </h3>
                <p className="text-slate-500 mt-1">
                  Gerenciamento de estabelecimentos cadastrados na rede para viabilizar transferências de lotes entre postos de saúde.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {ubsList.map(ubs => (
                  <div key={ubs.id} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{ubs.name}</div>
                      <div className="text-[11px] text-slate-500">CNES: {ubs.cnes} · {ubs.district} - {ubs.city}</div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      Ativa no Sistema
                    </span>
                  </div>
                ))}
              </div>

              {/* Add UBS Form */}
              <form onSubmit={handleCreateUbs} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-teal-800" />
                  <span>Adicionar Nova Unidade Básica de Saúde</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome da UBS (ex: UBS Vila Nova)"
                    value={newUbsName}
                    onChange={(e) => setNewUbsName(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Número CNES (ex: 4501923)"
                    value={newUbsCnes}
                    onChange={(e) => setNewUbsCnes(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Bairro / Distrito"
                    value={newUbsDistrict}
                    onChange={(e) => setNewUbsDistrict(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Cidade - UF"
                    value={newUbsCity}
                    onChange={(e) => setNewUbsCity(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded font-medium text-xs"
                >
                  Cadastrar UBS
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PROFISSIONAIS */}
          {activeTab === 'operadores' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Profissionais de Saúde & Controle de Auditoria
                </h3>
                <p className="text-slate-500 mt-1">
                  Identificação do usuário responsável por cada movimentação física de lote na farmácia e no almoxarifado.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {operators.map(op => (
                  <div key={op.id} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{op.name}</div>
                      <div className="text-[11px] text-slate-500">{op.role} · Reg: {op.registration}</div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                      Habilitado
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Operator Form */}
              <form onSubmit={handleCreateOperator} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-teal-800" />
                  <span>Cadastrar Novo Profissional</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    value={newOpName}
                    onChange={(e) => setNewOpName(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Cargo / Especialidade"
                    value={newOpRole}
                    onChange={(e) => setNewOpRole(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Registro (ex: CRF 12345)"
                    value={newOpReg}
                    onChange={(e) => setNewOpReg(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded font-medium text-xs"
                >
                  Cadastrar Profissional
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: BANCO E RESTAURAÇÃO */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Persistência de Dados & Demonstração
                </h3>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Os dados estão salvos e são mantidos automaticamente após atualizar ou fechar o navegador. Use os controles abaixo para restaurar o conjunto inicial de demonstração.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Restaurar Dados Padrão de Demonstração</h4>
                    <p className="text-[11px] text-slate-500">
                      Recarrega os lotes fictícios de Amoxicilina, Insulina, Soro, Luvas e histórico de auditoria inicial.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Deseja realmente restaurar os dados de demonstração da UBS?')) {
                        onResetDemo();
                        onClose();
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium flex items-center gap-1.5 border border-slate-300"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Demonstração</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors text-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
