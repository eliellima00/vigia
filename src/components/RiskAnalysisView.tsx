import React, { useState } from 'react';
import { 
  TrendingDown, 
  AlertTriangle, 
  Info, 
  HelpCircle, 
  Send, 
  Edit3, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import { Product, Batch, LossRiskAnalysis, UBS } from '../types';
import { formatDateBR } from '../utils/calculations';

interface RiskAnalysisViewProps {
  riskList: LossRiskAnalysis[];
  products: Product[];
  batches: Batch[];
  activeUbs: UBS;
  onUpdateMonthlyConsumption: (productId: string, consumption: number) => void;
  onOpenRelocate: (batch: Batch, product: Product) => void;
  onOpenDispense: (batch: Batch, product: Product) => void;
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
  riskList,
  products,
  batches,
  activeUbs,
  onUpdateMonthlyConsumption,
  onOpenRelocate,
  onOpenDispense,
}) => {
  // Quick inline consumption editing
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempConsumption, setTempConsumption] = useState<string>('');

  const handleStartEdit = (prodId: string, currentVal?: number) => {
    setEditingProductId(prodId);
    setTempConsumption(currentVal ? String(currentVal) : '');
  };

  const handleSaveConsumption = (prodId: string) => {
    const parsed = parseInt(tempConsumption, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateMonthlyConsumption(prodId, parsed);
    }
    setEditingProductId(null);
  };

  const criticalRisks = riskList.filter(r => r.riskLevel === 'critico');
  const moderateRisks = riskList.filter(r => r.riskLevel === 'moderado');
  const insufficientDataItems = riskList.filter(r => !r.hasSufficientData);
  const safeItems = riskList.filter(r => r.riskLevel === 'baixo');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 tracking-wide uppercase">
                Inteligência Preditiva de Desperdício
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Estimativa Baseada em Consumo Médio</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Análise de Risco de Perda por Vencimento
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Comparação entre a quantidade física em estoque e a capacidade real de consumo da UBS até a data de expiração dos lotes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs font-semibold text-orange-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>{criticalRisks.length + moderateRisks.length} item(ns) com excedente em risco</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions & Limitations Box (Premissas e limitações dos cálculos) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs">
          <Info className="w-4 h-4 text-teal-800 shrink-0" />
          <span>Premissas e Limitações Metodológicas do Cálculo</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] leading-relaxed">
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <strong className="text-slate-900 block mb-1">1. Consumo Linear:</strong>
            O cálculo estima o consumo projetado multiplicando a média mensal cadastrada pelos meses até o vencimento:
            <code className="text-teal-800 font-mono block mt-1">Consumo Est. = Média/Mês × (Dias ÷ 30.4)</code>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <strong className="text-slate-900 block mb-1">2. Sazonalidades e Picos:</strong>
            Não contempla surtos epidemiológicos atípicos (ex: picos de gripe, dengue) ou campanhas pontuais de imunização, a menos que a média seja atualizada pela equipe técnica.
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
            <strong className="text-slate-900 block mb-1">3. Confiança dos Dados:</strong>
            Itens sem histórico ou média mensal registrada são destacados como <em>Indeterminados</em>, exigindo preenchimento antes da tomada de decisão gerencial.
          </div>
        </div>
      </div>

      {/* Critical and Moderate Risk Items (Excedente sinalizado) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Produtos com Risco Ativo de Perda / Estoque Excedente
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            O estoque disponível supera o consumo esperado antes da data de validade. Recomenda-se remanejamento ou ajuste clínico imediato.
          </p>
        </div>

        {criticalRisks.length === 0 && moderateRisks.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 text-sm">Nenhum risco de perda identificado</p>
            <p className="text-xs text-slate-500 mt-1">Todos os produtos com consumo mensal cadastrado têm saída estimada garantida antes da validade.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Produto & Lote Crítico</th>
                  <th className="py-2.5 px-3 text-right">Estoque Físico</th>
                  <th className="py-2.5 px-3">Validade</th>
                  <th className="py-2.5 px-3 text-right">Média Mensal</th>
                  <th className="py-2.5 px-3 text-right">Consumo Estimado</th>
                  <th className="py-2.5 px-3 text-right">Excedente em Risco</th>
                  <th className="py-2.5 px-3">Gravidade</th>
                  <th className="py-2.5 px-4 text-right">Ação Proposta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...criticalRisks, ...moderateRisks].map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <tr key={item.productId} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>Lote: <strong className="font-mono text-slate-700">{item.earliestBatch.batchNumber}</strong></span>
                          <span>·</span>
                          <span>{item.storageLocation}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {item.totalQuantity.toLocaleString('pt-BR')} <span className="text-[11px] font-normal text-slate-500">{item.unit}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono font-semibold text-slate-900">
                          {formatDateBR(item.earliestBatch.expirationDate)}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.daysRemaining < 0 ? 'Já vencido' : `${item.daysRemaining}d (~${item.monthsRemaining} meses)`}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        {item.monthlyConsumption ? `${item.monthlyConsumption.toLocaleString('pt-BR')} /mês` : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        ~{item.estimatedConsumptionUntilExpiry?.toLocaleString('pt-BR')} {item.unit}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="font-mono tabular-nums font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                          +{item.potentialSurplusRisk?.toLocaleString('pt-BR')} {item.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {item.riskLevel === 'critico' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            Moderado
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenRelocate(item.earliestBatch, product)}
                            className="px-2.5 py-1 text-[11px] font-medium text-white bg-teal-800 hover:bg-teal-900 rounded transition-colors shadow-2xs flex items-center gap-1"
                            title="Remanejar lote ou parte dele para outra UBS da rede municipal"
                          >
                            <Send className="w-3 h-3" />
                            <span>Remanejar p/ outra UBS</span>
                          </button>
                          <button
                            onClick={() => onOpenDispense(item.earliestBatch, product)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            Dispensar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Items with Insufficient Data (Dados Insuficientes) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">
              Produtos sem Consumo Médio Informado (Dados Insuficientes)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sem o consumo médio mensal, <strong>não é possível estimar o risco de perda com confiança matemática</strong>. Cadastre a estimativa para habilitar o monitoramento automático.
          </p>
        </div>

        {insufficientDataItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            Todos os produtos cadastrados possuem consumo médio mensal preenchido.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {insufficientDataItems.map(item => {
              const isEditingThis = editingProductId === item.productId;

              return (
                <div key={item.productId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/75 transition-colors text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {item.productName}
                    </div>
                    <div className="text-slate-500 flex items-center gap-2 mt-1">
                      <span>Estoque atual: <strong className="font-mono text-slate-700">{item.totalQuantity} {item.unit}</strong></span>
                      <span>·</span>
                      <span>Lote mais próximo: <strong className="font-mono text-slate-700">{item.earliestBatch.batchNumber}</strong></span>
                      <span>·</span>
                      <span>Validade: <strong className="font-mono text-slate-700">{formatDateBR(item.earliestBatch.expirationDate)}</strong></span>
                      <span>·</span>
                      <span className="text-amber-800 font-medium">Dados insuficientes para calcular risco</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          placeholder="Média mensal..."
                          value={tempConsumption}
                          onChange={(e) => setTempConsumption(e.target.value)}
                          className="w-28 text-xs bg-white border border-slate-300 rounded px-2 py-1 font-mono tabular-nums"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveConsumption(item.productId)}
                          className="px-2.5 py-1 bg-teal-800 text-white rounded font-medium hover:bg-teal-900"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingProductId(null)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item.productId, item.monthlyConsumption)}
                        className="px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Informar Consumo Médio</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
