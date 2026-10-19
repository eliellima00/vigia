import React, { useState } from 'react';
import { X, History, Search, Download, ShieldCheck, User } from 'lucide-react';
import { AuditLog, UBS } from '../types';
import { exportAuditLogsCSV } from '../utils/export';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLog[];
  activeUbs: UBS;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  activeUbs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(log => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = log.productName.toLowerCase().includes(term);
      const matchUser = log.userName.toLowerCase().includes(term);
      const matchDetails = log.details.toLowerCase().includes(term);
      const matchBatch = (log.batchNumber || '').toLowerCase().includes(term);
      if (!matchName && !matchUser && !matchDetails && !matchBatch) return false;
    }

    if (selectedAction !== 'all' && log.action !== selectedAction) {
      return false;
    }

    return true;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CADASTRO_PRODUTO':
      case 'NOVO_LOTE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'DISPENSA_ESTOQUE':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'EDICAO_LOTE':
      case 'AJUSTE_ESTOQUE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'REMANEJAMENTO':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'EXCLUSAO_LOTE':
      case 'EXCLUSAO_PRODUTO':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-teal-800" />
              <h2 className="text-base font-bold text-slate-900">
                Histórico de Alterações e Auditoria de Operações
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rastreabilidade individual de quem cadastrou, editou, dispensou ou excluiu insumos na {activeUbs.name}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportAuditLogsCSV(filteredLogs, activeUbs.name)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por profissional, medicamento, lote..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            >
              <option value="all">Todas as Operações</option>
              <option value="CADASTRO_PRODUTO">Cadastros de Produto</option>
              <option value="NOVO_LOTE">Entradas de Lote</option>
              <option value="DISPENSA_ESTOQUE">Dispensações (Saídas)</option>
              <option value="AJUSTE_ESTOQUE">Ajustes de Estoque</option>
              <option value="REMANEJAMENTO">Remanejamentos</option>
              <option value="EXCLUSAO_LOTE">Exclusões</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              Nenhum registro de auditoria encontrado.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-medium border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">
                        {log.productName}
                      </span>
                      {log.batchNumber && (
                        <span className="text-slate-500">
                          (Lote: <strong className="font-mono">{log.batchNumber}</strong>)
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-xs">
                    {log.details}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Responsável: <strong className="text-slate-700">{log.userName}</strong></span>
                    <span>·</span>
                    <span>{log.userRole}</span>
                    {log.quantityDelta !== undefined && (
                      <>
                        <span>·</span>
                        <span className="font-mono font-semibold">
                          Delta: {log.quantityDelta > 0 ? `+${log.quantityDelta}` : log.quantityDelta} un.
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredLogs.length} registro(s) no livro de auditoria</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
