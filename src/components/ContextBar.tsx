import React from 'react';
import { Building2, UserCheck, Calendar, RotateCcw } from 'lucide-react';
import { UBS, UserOperator } from '../types';

interface ContextBarProps {
  ubsList: UBS[];
  activeUbs: UBS;
  onSelectUbs: (ubsId: string) => void;
  operators: UserOperator[];
  activeOperator: UserOperator;
  onSelectOperator: (operatorId: string) => void;
  onResetDemo: () => void;
  isDemoActive?: boolean;
}

export const ContextBar: React.FC<ContextBarProps> = ({
  ubsList,
  activeUbs,
  onSelectUbs,
  operators,
  activeOperator,
  onSelectOperator,
  onResetDemo,
}) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
        
        {/* Left: Tagline and Date */}
        <div className="flex items-center gap-3">
          <p className="font-medium text-slate-800">
            Menos desperdício. Mais cuidado.
          </p>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{currentDate}</span>
          </div>
        </div>

        {/* Right: UBS Selector + Current Operator */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* UBS Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1">
            <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="text-slate-500 text-[11px]">Unidade:</span>
            <select
              value={activeUbs.id}
              onChange={(e) => onSelectUbs(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {ubsList.map((ubs) => (
                <option key={ubs.id} value={ubs.id}>
                  {ubs.name} (CNES {ubs.cnes})
                </option>
              ))}
            </select>
          </div>

          {/* Operator Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 text-[11px]">Operador:</span>
            <select
              value={activeOperator.id}
              onChange={(e) => onSelectOperator(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[190px] truncate"
            >
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.role})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            title="Restaurar dados de demonstração da UBS"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="text-[11px]">Dados de Exemplo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
