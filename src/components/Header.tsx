import React from 'react';
import { ShieldCheck, Plus, SlidersHorizontal, History } from 'lucide-react';

export type ActiveTab = 'painel' | 'cadastro' | 'estoque' | 'alertas' | 'risco' | 'relatorios';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewProduct: () => void;
  onOpenAuditLogs: () => void;
  onOpenSettings: () => void;
  urgentAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNewProduct,
  onOpenAuditLogs,
  onOpenSettings,
  urgentAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => onTabChange('painel')}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-teal-900 transition-colors">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
              VIGIA
            </span>
          </button>

          {/* Zone 2: 4-6 concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('painel')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
                activeTab === 'painel'
                  ? 'border-teal-700 text-teal-800 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Painel Geral
            </button>
            <button
              onClick={() => onTabChange('estoque')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
                activeTab === 'estoque'
                  ? 'border-teal-700 text-teal-800 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Estoque & FEFO
            </button>
            <button
              onClick={() => onTabChange('alertas')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'alertas'
                  ? 'border-teal-700 text-teal-800 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>Alertas</span>
              {urgentAlertCount > 0 && (
                <span className="text-xs font-mono tabular-nums px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">
                  {urgentAlertCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onTabChange('risco')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
                activeTab === 'risco'
                  ? 'border-teal-700 text-teal-800 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Risco de Perda
            </button>
            <button
              onClick={() => onTabChange('cadastro')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
                activeTab === 'cadastro'
                  ? 'border-teal-700 text-teal-800 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Novo Lote
            </button>
            <button
              onClick={() => onTabChange('relatorios')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
                activeTab === 'relatorios'
                  ? 'border-teal-700 text-teal-800 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Relatórios
            </button>
          </nav>

          {/* Zone 3: Primary action button + tool triggers */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAuditLogs}
              title="Histórico de auditoria e operações da equipe"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              title="Configurações e faixas de alerta"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewProduct}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Lote</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="lg:hidden flex items-center overflow-x-auto no-scrollbar px-4 py-2 border-t border-slate-100 bg-slate-50 gap-2">
        {(['painel', 'estoque', 'alertas', 'risco', 'cadastro', 'relatorios'] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            {tab === 'painel' && 'Painel'}
            {tab === 'estoque' && 'Estoque'}
            {tab === 'alertas' && `Alertas ${urgentAlertCount > 0 ? `(${urgentAlertCount})` : ''}`}
            {tab === 'risco' && 'Risco de Perda'}
            {tab === 'cadastro' && 'Cadastrar'}
            {tab === 'relatorios' && 'Relatórios'}
          </button>
        ))}
      </div>
    </header>
  );
};
