import React, { useState } from 'react';
import { X, Send, AlertCircle, Building2 } from 'lucide-react';
import { Batch, Product, UBS, UserOperator } from '../types';
import { formatDateBR, calculateDaysRemaining } from '../utils/calculations';

interface RelocateModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  product: Product | null;
  ubsList: UBS[];
  currentUbs: UBS;
  activeOperator: UserOperator;
  onConfirmRelocate: (batchId: string, quantityToRelocate: number, targetUbsId: string, justification: string) => void;
}

export const RelocateModal: React.FC<RelocateModalProps> = ({
  isOpen,
  onClose,
  batch,
  product,
  ubsList,
  currentUbs,
  activeOperator,
  onConfirmRelocate,
}) => {
  const otherUbs = ubsList.filter(u => u.id !== currentUbs.id);
  const [targetUbsId, setTargetUbsId] = useState(otherUbs[0]?.id || '');
  const [relocateQty, setRelocateQty] = useState(batch ? String(batch.quantity) : '1');
  const [justification, setJustification] = useState('Prevenção de vencimento por excesso de estoque na unidade de origem');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !batch || !product) return null;

  const days = calculateDaysRemaining(batch.expirationDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUbsId) {
      setError('Selecione a UBS de destino.');
      return;
    }
    const qty = parseInt(relocateQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Informe uma quantidade válida.');
      return;
    }
    if (qty > batch.quantity) {
      setError(`A quantidade não pode exceder o saldo atual (${batch.quantity}).`);
      return;
    }

    onConfirmRelocate(batch.id, qty, targetUbsId, justification);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Remanejamento entre Unidades Básicas de Saúde
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Evita perdas transferindo lotes próximos do vencimento para unidades com maior demanda
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Batch Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 text-sm">
              {product.name}
            </div>
            <div className="text-slate-600 flex items-center gap-2">
              <span>Lote: <strong className="font-mono text-slate-800">{batch.batchNumber}</strong></span>
              <span>·</span>
              <span>Saldo disponível: <strong className="font-mono tabular-nums text-slate-800">{batch.quantity} {product.unit}</strong></span>
            </div>
            <div className="text-[11px] text-slate-500">
              Validade: <strong className="font-mono">{formatDateBR(batch.expirationDate)}</strong> ({days} dias restantes)
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target UBS */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              UBS de Destino *
            </label>
            <div className="relative">
              <select
                value={targetUbsId}
                onChange={(e) => setTargetUbsId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                required
              >
                {otherUbs.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} (CNES {u.cnes} - {u.district})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Quantidade a Transferir *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={batch.quantity}
                value={relocateQty}
                onChange={(e) => setRelocateQty(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-semibold"
                required
              />
              <span className="text-slate-500 font-medium whitespace-nowrap">{product.unit}</span>
            </div>
          </div>

          {/* Justification */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Justificativa Técnica do Remanejamento *
            </label>
            <input
              type="text"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              required
            />
          </div>

          {/* Responsible Operator notice */}
          <div className="text-[11px] text-slate-400">
            Operação assinada por: <strong>{activeOperator.name}</strong> ({activeOperator.registration})
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg transition-colors font-medium shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirmar Transferência</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
