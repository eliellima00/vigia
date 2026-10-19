import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  Sliders, 
  Send, 
  Calendar,
  Info,
  Package
} from 'lucide-react';
import { Product, Batch, AlertThresholds, ExpirationStatus } from '../types';
import { calculateDaysRemaining, formatDateBR, getStatusBadgeStyle } from '../utils/calculations';

interface AlertsViewProps {
  products: Product[];
  batches: Batch[];
  thresholds: AlertThresholds;
  onUpdateThresholds: (newThresholds: AlertThresholds) => void;
  onOpenDispense: (batch: Batch, product: Product) => void;
  onOpenRelocate: (batch: Batch, product: Product) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  products,
  batches,
  thresholds,
  onUpdateThresholds,
  onOpenDispense,
  onOpenRelocate,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | ExpirationStatus>('all');
  const [showThresholdEditor, setShowThresholdEditor] = useState(false);

  // Local threshold edits
  const [highPriority, setHighPriority] = useState(thresholds.highPriorityDays);
  const [attention, setAttention] = useState(thresholds.attentionDays);
  const [monitoring, setMonitoring] = useState(thresholds.monitoringDays);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThresholds({
      highPriorityDays: Number(highPriority),
      attentionDays: Number(attention),
      monitoringDays: Number(monitoring),
    });
    setShowThresholdEditor(false);
  };

  // Evaluate batch status
  const evaluatedBatches = batches.map(batch => {
    const product = products.find(p => p.id === batch.productId);
    const days = calculateDaysRemaining(batch.expirationDate);
    const isExpired = days < 0;

    let status: ExpirationStatus;
    if (isExpired) {
      status = 'vencido';
    } else if (days <= thresholds.highPriorityDays) {
      status = 'prioridade_alta';
    } else if (days <= thresholds.attentionDays) {
      status = 'atencao';
    } else if (days <= thresholds.monitoringDays) {
      status = 'monitoramento';
    } else {
      status = 'normal';
    }

    return {
      batch,
      product,
      days,
      isExpired,
      status,
    };
  });

  // Filter batches
  const filtered = evaluatedBatches
    .filter(item => item.product && item.batch.quantity > 0)
    .filter(item => {
      if (selectedFilter === 'all') return true;
      return item.status === selectedFilter;
    })
    .sort((a, b) => a.days - b.days);

  // Counts for each category
  const countExpired = evaluatedBatches.filter(i => i.status === 'vencido' && i.batch.quantity > 0).length;
  const countHigh = evaluatedBatches.filter(i => i.status === 'prioridade_alta' && i.batch.quantity > 0).length;
  const countAttention = evaluatedBatches.filter(i => i.status === 'atencao' && i.batch.quantity > 0).length;
  const countMonitoring = evaluatedBatches.filter(i => i.status === 'monitoramento' && i.batch.quantity > 0).length;
  const countNormal = evaluatedBatches.filter(i => i.status === 'normal' && i.batch.quantity > 0).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 tracking-wide uppercase">
                Monitoramento Preventivo
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Faixas Configuráveis</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Alertas Inteligentes de Vencimento
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Cálculo automatizado do prazo exato com exibição da data completa registrada para conferência física antes de qualquer descarte.
            </p>
          </div>

          <button
            onClick={() => setShowThresholdEditor(!showThresholdEditor)}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-800" />
            <span>Configurar Faixas de Dias</span>
          </button>
        </div>

        {/* Threshold Configuration Drawer */}
        {showThresholdEditor && (
          <form 
            onSubmit={handleSaveThresholds}
            className="mt-4 pt-4 border-t border-slate-200 p-4 bg-slate-50 rounded-lg text-xs space-y-3"
          >
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-800" />
              <span>Painel do Administrador: Parâmetros das Faixas de Alerta</span>
            </div>
            <p className="text-slate-500">
              Ajuste os limites de dias para calibrar os alertas da equipe de saúde de acordo com a rotatividade desta UBS.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-medium text-amber-800 mb-1">
                  Prioridade Alta (limite máximo de dias):
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">1 até</span>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={highPriority}
                    onChange={(e) => setHighPriority(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded px-2 py-1 font-mono font-semibold"
                    required
                  />
                  <span className="text-slate-500">dias</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-orange-700 mb-1">
                  Atenção (limite máximo de dias):
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">{Number(highPriority) + 1} até</span>
                  <input
                    type="number"
                    min={Number(highPriority) + 1}
                    max="120"
                    value={attention}
                    onChange={(e) => setAttention(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded px-2 py-1 font-mono font-semibold"
                    required
                  />
                  <span className="text-slate-500">dias</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-teal-800 mb-1">
                  Monitoramento (limite máximo de dias):
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">{Number(attention) + 1} até</span>
                  <input
                    type="number"
                    min={Number(attention) + 1}
                    max="180"
                    value={monitoring}
                    onChange={(e) => setMonitoring(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded px-2 py-1 font-mono font-semibold"
                    required
                  />
                  <span className="text-slate-500">dias</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowThresholdEditor(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded shadow-xs"
              >
                Salvar Novas Faixas
              </button>
            </div>
          </form>
        )}

        {/* Filter Tabs by Expiration Range */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos os Lotes ({evaluatedBatches.filter(i => i.batch.quantity > 0).length})
          </button>

          <button
            onClick={() => setSelectedFilter('vencido')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedFilter === 'vencido'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Vencidos ({countExpired})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('prioridade_alta')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedFilter === 'prioridade_alta'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Prioridade Alta 1-{thresholds.highPriorityDays}d ({countHigh})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('atencao')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedFilter === 'atencao'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Atenção {thresholds.highPriorityDays + 1}-{thresholds.attentionDays}d ({countAttention})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('monitoramento')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedFilter === 'monitoramento'
                ? 'bg-teal-700 text-white'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
          >
            <span>Monitoramento {thresholds.attentionDays + 1}-{thresholds.monitoringDays}d ({countMonitoring})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('normal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedFilter === 'normal'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Normal &gt;{thresholds.monitoringDays}d ({countNormal})</span>
          </button>

        </div>
      </div>

      {/* Regulation Compliance Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">
            Diretrizes de Boas Práticas Farmacêuticas (RDC ANVISA):
          </p>
          <p className="text-amber-800 leading-relaxed">
            Nenhum medicamento é considerado vencido antes do término do último dia do mês ou da data explícita de validade registrada na embalagem. Itens com prazo ultrapassado devem ser imediatamente transferidos para a área física de quarentena/segregação e documentados no Termo de Descarte e Resíduos de Saúde.
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando <strong>{filtered.length}</strong> lote(s) na faixa selecionada
          </span>
          <span className="text-[11px] text-slate-400">
            Data de referência hoje: {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-sm">Nenhum lote nesta faixa de alerta</p>
            <p className="text-xs text-slate-400 mt-1">O estoque está equilibrado de acordo com os parâmetros configurados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Produto & Tipo</th>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3 text-right">Qtd. Atual</th>
                  <th className="py-2.5 px-3">Data Registrada (Completa)</th>
                  <th className="py-2.5 px-3">Contagem Exata</th>
                  <th className="py-2.5 px-3">Classificação</th>
                  <th className="py-2.5 px-3">Localização</th>
                  <th className="py-2.5 px-4 text-right">Ação Preventiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ batch, product, days, isExpired, status }) => {
                  if (!product) return null;
                  const style = getStatusBadgeStyle(status);

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{product.category}</span>
                          {product.code && (
                            <>
                              <span>·</span>
                              <span className="font-mono">{product.code}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {batch.batchNumber}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {batch.quantity.toLocaleString('pt-BR')} <span className="text-[11px] font-normal text-slate-500">{product.unit}</span>
                      </td>

                      {/* Display full date explicitly as required */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-900 font-semibold bg-slate-50/50">
                        {formatDateBR(batch.expirationDate)}
                      </td>

                      {/* Exact days count */}
                      <td className="py-3 px-3 font-mono tabular-nums font-semibold">
                        {isExpired ? (
                          <span className="text-rose-700">Vencido há {Math.abs(days)} dia(s)</span>
                        ) : days === 0 ? (
                          <span className="text-amber-800">Vence hoje!</span>
                        ) : (
                          <span className={days <= thresholds.highPriorityDays ? 'text-amber-800 font-bold' : 'text-slate-700'}>
                            {days} dia(s) restantes
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
                          {style.tag}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 text-[11px] max-w-[150px] truncate" title={batch.storageLocation || product.storageLocation}>
                        {batch.storageLocation || product.storageLocation}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isExpired ? (
                          <span className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded">
                            Segregado para Descarte
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenDispense(batch, product)}
                              className="px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded transition-colors border border-teal-200"
                            >
                              Dispensar FEFO
                            </button>
                            <button
                              onClick={() => onOpenRelocate(batch, product)}
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Remanejar</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
