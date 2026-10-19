import React, { useState } from 'react';
import { X, Check, AlertCircle, Calendar } from 'lucide-react';
import { Batch, Product, UserOperator } from '../types';
import { formatDateBR, calculateDaysRemaining } from '../utils/calculations';

interface DispenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  product: Product | null;
  activeOperator: UserOperator;
  onConfirmDispense: (batchId: string, quantityToDispense: number, reason: string) => void;
}

export const DispenseModal: React.FC<DispenseModalProps> = ({
  isOpen,
  onClose,
  batch,
  product,
  activeOperator,
  onConfirmDispense,
}) => {
  const [dispenseQty, setDispenseQty] = useState('1');
  const [reason, setReason] = useState('Dispensação com receita médica - Paciente SUS');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !batch || !product) return null;

  const days = calculateDaysRemaining(batch.expirationDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(dispenseQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Informe uma quantidade válida superior a zero.');
      return;
    }
    if (qty > batch.quantity) {
      setError(`A quantidade informada (${qty}) é maior do que o saldo atual do lote (${batch.quantity}).`);
      return;
    }

    onConfirmDispense(batch.id, qty, reason);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Dispensação / Saída de Estoque (FEFO)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Registro com baixa automática e auditoria por {activeOperator.name}
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
          
          {/* Product Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 text-sm">
              {product.name}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span>Lote: <strong className="font-mono text-slate-800">{batch.batchNumber}</strong></span>
              <span>·</span>
              <span>Saldo atual: <strong className="font-mono tabular-nums text-slate-800">{batch.quantity} {product.unit}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Validade: <strong className="font-mono">{formatDateBR(batch.expirationDate)}</strong> ({days} dias restantes)</span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quantity to Dispense */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Quantidade a Dispensar / Baixar *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={batch.quantity}
                value={dispenseQty}
                onChange={(e) => {
                  setDispenseQty(e.target.value);
                  setError(null);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-semibold"
                required
                autoFocus
              />
              <span className="text-slate-500 font-medium whitespace-nowrap">{product.unit}</span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Motivo da Saída / Justificativa *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            >
              <option value="Dispensação com receita médica - Paciente SUS">
                Dispensação com receita médica - Paciente SUS
              </option>
              <option value="Uso em procedimento interno na UBS (Curativo/Vacina/Emergência)">
                Uso em procedimento interno na UBS (Curativo/Vacina/Emergência)
              </option>
              <option value="Abastecimento diário de consultório médico / odontológico">
                Abastecimento diário de consultório médico / odontológico
              </option>
              <option value="Perda por quebra de frasco / avaria acidental">
                Perda por quebra de frasco / avaria acidental
              </option>
              <option value="Ajuste de inventário físico periódico">
                Ajuste de inventário físico periódico
              </option>
            </select>
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
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Baixa</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
