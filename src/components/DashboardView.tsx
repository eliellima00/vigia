import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  TrendingDown, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Boxes,
  HelpCircle
} from 'lucide-react';
import { Product, Batch, AlertThresholds, UBS, LossRiskAnalysis } from '../types';
import { calculateDaysRemaining, formatDateBR, getStatusBadgeStyle } from '../utils/calculations';

interface DashboardViewProps {
  products: Product[];
  batches: Batch[];
  thresholds: AlertThresholds;
  activeUbs: UBS;
  riskList: LossRiskAnalysis[];
  onNavigate: (tab: 'painel' | 'cadastro' | 'estoque' | 'alertas' | 'risco' | 'relatorios') => void;
  onOpenDispense: (batch: Batch, product: Product) => void;
  onOpenRelocate: (batch: Batch, product: Product) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  batches,
  thresholds,
  activeUbs,
  riskList,
  onNavigate,
  onOpenDispense,
  onOpenRelocate,
}) => {
  // Metric 1: Total products and total units
  const totalProducts = products.length;
  const totalUnits = batches.reduce((acc, b) => acc + b.quantity, 0);

  // Metric 2: Batches near expiry (1 to thresholds.attentionDays)
  const expiringBatches = batches.filter(b => {
    const days = calculateDaysRemaining(b.expirationDate);
    return days >= 0 && days <= thresholds.attentionDays && b.quantity > 0;
  });

  // Metric 3: Expired batches (days < 0 and quantity > 0)
  const expiredBatches = batches.filter(b => {
    const days = calculateDaysRemaining(b.expirationDate);
    return days < 0 && b.quantity > 0;
  });

  // Metric 4: Products with loss risk (riskLevel === 'critico' or 'moderado')
  const productsWithRisk = riskList.filter(r => r.riskLevel === 'critico' || r.riskLevel === 'moderado');

  // Metric 5: Urgent attention required (expired + high priority <= 30 days)
  const highPriorityBatches = batches.filter(b => {
    const days = calculateDaysRemaining(b.expirationDate);
    return days >= 0 && days <= thresholds.highPriorityDays && b.quantity > 0;
  });
  const urgentAlertsCount = expiredBatches.length + highPriorityBatches.length;

  // Breakdown by Expiration Range
  const countNormal = batches.filter(b => calculateDaysRemaining(b.expirationDate) > thresholds.monitoringDays && b.quantity > 0).length;
  const countMonitoring = batches.filter(b => {
    const d = calculateDaysRemaining(b.expirationDate);
    return d > thresholds.attentionDays && d <= thresholds.monitoringDays && b.quantity > 0;
  }).length;
  const countAttention = batches.filter(b => {
    const d = calculateDaysRemaining(b.expirationDate);
    return d > thresholds.highPriorityDays && d <= thresholds.attentionDays && b.quantity > 0;
  }).length;
  const countHighPriority = highPriorityBatches.length;
  const countExpired = expiredBatches.length;
  const activeBatchesCount = batches.filter(b => b.quantity > 0).length || 1;

  // Category breakdown
  const medProducts = products.filter(p => p.category === 'medicamento');
  const matProducts = products.filter(p => p.category === 'material');

  const medBatches = batches.filter(b => {
    const p = products.find(prod => prod.id === b.productId);
    return p?.category === 'medicamento' && b.quantity > 0;
  });
  const matBatches = batches.filter(b => {
    const p = products.find(prod => prod.id === b.productId);
    return p?.category === 'material' && b.quantity > 0;
  });

  // Priority Alerts Table items (top 5 most critical)
  const priorityAlerts = [...batches]
    .filter(b => b.quantity > 0)
    .sort((a, b) => {
      const daysA = calculateDaysRemaining(a.expirationDate);
      const daysB = calculateDaysRemaining(b.expirationDate);
      return daysA - daysB;
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & UBS Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 tracking-wide uppercase">
                Visão Geral Operacional
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {activeUbs.name} (CNES {activeUbs.cnes})
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Painel de Controle de Validade & Estoque
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Acompanhamento contínuo baseado no princípio FEFO (Primeiro que Vence, Primeiro que Sai) para erradicação de perdas na atenção básica.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('estoque')}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Ver Estoque FEFO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('cadastro')}
              className="px-3.5 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>+ Cadastrar Lote</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Produtos */}
        <div 
          onClick={() => onNavigate('estoque')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Total de Produtos</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalProducts}
            </span>
            <span className="text-xs text-slate-500">itens ativos</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Volume em estoque:</span>
            <span className="font-semibold font-mono tabular-nums text-slate-700">{totalUnits.toLocaleString('pt-BR')} un.</span>
          </div>
        </div>

        {/* Card 2: Lotes Próximos do Vencimento */}
        <div 
          onClick={() => onNavigate('alertas')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-amber-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Próximos do Vencimento</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
              {expiringBatches.length}
            </span>
            <span className="text-xs text-slate-500">lotes ≤ 60 dias</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 flex items-center justify-between border-t border-slate-100 pt-2 font-medium">
            <span>Priorizar saída imediata</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Lotes Vencidos */}
        <div 
          onClick={() => onNavigate('alertas')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-rose-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Lotes Vencidos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
              {expiredBatches.length}
            </span>
            <span className="text-xs text-slate-500">segregar p/ descarte</span>
          </div>
          <div className="mt-2 text-xs text-rose-700 flex items-center justify-between border-t border-slate-100 pt-2 font-medium">
            <span>{expiredBatches.length > 0 ? 'Exige termo de descarte' : 'Nenhum lote vencido'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Risco de Perda */}
        <div 
          onClick={() => onNavigate('risco')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-orange-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Risco de Perda</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-700 font-mono tabular-nums">
              {productsWithRisk.length}
            </span>
            <span className="text-xs text-slate-500">itens excedentes</span>
          </div>
          <div className="mt-2 text-xs text-orange-700 flex items-center justify-between border-t border-slate-100 pt-2 font-medium">
            <span>Remanejar para outra UBS</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 5: Alertas que Exigem Atenção */}
        <div 
          onClick={() => onNavigate('alertas')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-teal-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Atenção Prioritária</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {urgentAlertsCount}
            </span>
            <span className="text-xs text-slate-500">casos urgentes</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{countHighPriority} em 30d · {countExpired} vencidos</span>
          </div>
        </div>

      </div>

      {/* Visual Charts & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Faixas de Validade (Progress Bars) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Distribuição dos Lotes por Faixa de Validade
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Classificação automática calculada com base na data atual e faixas configuradas
              </p>
            </div>
            <button
              onClick={() => onNavigate('alertas')}
              className="text-xs font-medium text-teal-800 hover:text-teal-900 flex items-center gap-1"
            >
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Vencidos */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                  Vencido (Data ultrapassada)
                </span>
                <span className="font-mono tabular-nums text-slate-600 font-semibold">
                  {countExpired} lote{countExpired !== 1 ? 's' : ''} ({Math.round((countExpired / activeBatchesCount) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-300" 
                  style={{ width: `${(countExpired / activeBatchesCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Prioridade Alta (1 a 30 dias) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Prioridade Alta (1 a {thresholds.highPriorityDays} dias)
                </span>
                <span className="font-mono tabular-nums text-slate-600 font-semibold">
                  {countHighPriority} lote{countHighPriority !== 1 ? 's' : ''} ({Math.round((countHighPriority / activeBatchesCount) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300" 
                  style={{ width: `${(countHighPriority / activeBatchesCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Atenção (31 a 60 dias) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-orange-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  Atenção ({thresholds.highPriorityDays + 1} a {thresholds.attentionDays} dias)
                </span>
                <span className="font-mono tabular-nums text-slate-600 font-semibold">
                  {countAttention} lote{countAttention !== 1 ? 's' : ''} ({Math.round((countAttention / activeBatchesCount) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 transition-all duration-300" 
                  style={{ width: `${(countAttention / activeBatchesCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Monitoramento (61 a 90 dias) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-teal-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                  Monitoramento ({thresholds.attentionDays + 1} a {thresholds.monitoringDays} dias)
                </span>
                <span className="font-mono tabular-nums text-slate-600 font-semibold">
                  {countMonitoring} lote{countMonitoring !== 1 ? 's' : ''} ({Math.round((countMonitoring / activeBatchesCount) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 transition-all duration-300" 
                  style={{ width: `${(countMonitoring / activeBatchesCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Situação Normal (> 90 dias) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Situação Normal (&gt; {thresholds.monitoringDays} dias)
                </span>
                <span className="font-mono tabular-nums text-slate-600 font-semibold">
                  {countNormal} lote{countNormal !== 1 ? 's' : ''} ({Math.round((countNormal / activeBatchesCount) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${(countNormal / activeBatchesCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Categorias e Tipos */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Estoque por Categoria
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporção de medicamentos e insumos materiais
            </p>

            <div className="mt-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Medicamentos</span>
                  <span className="font-mono tabular-nums text-slate-900 font-bold">{medProducts.length} itens</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {medBatches.reduce((a, b) => a + b.quantity, 0).toLocaleString('pt-BR')} unidades em {medBatches.length} lotes
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Materiais & Insumos</span>
                  <span className="font-mono tabular-nums text-slate-900 font-bold">{matProducts.length} itens</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {matBatches.reduce((a, b) => a + b.quantity, 0).toLocaleString('pt-BR')} unidades em {matBatches.length} lotes
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1 text-teal-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Diretriz FEFO Ativa
            </span>
            <button
              onClick={() => onNavigate('cadastro')}
              className="hover:text-teal-800 font-medium"
            >
              + Adicionar Produto
            </button>
          </div>
        </div>

      </div>

      {/* Priority Alerts List (Tabela de Alertas Prioritários) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Lotes com Atenção Imediata (Ordem FEFO)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Itens vencidos ou com vencimento próximo ordenados cronologicamente para ação rápida da farmácia
            </p>
          </div>

          <button
            onClick={() => onNavigate('alertas')}
            className="text-xs font-medium text-teal-800 hover:text-teal-900 flex items-center gap-1"
          >
            Ver todos os alertas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-4">Produto & Categoria</th>
                <th className="py-2.5 px-3">Lote</th>
                <th className="py-2.5 px-3 text-right">Qtd. Disponível</th>
                <th className="py-2.5 px-3">Validade</th>
                <th className="py-2.5 px-3">Dias Restantes</th>
                <th className="py-2.5 px-3">Situação</th>
                <th className="py-2.5 px-3">Localização</th>
                <th className="py-2.5 px-4 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorityAlerts.map(batch => {
                const product = products.find(p => p.id === batch.productId);
                if (!product) return null;
                const days = calculateDaysRemaining(batch.expirationDate);
                const isExpired = days < 0;
                const style = getStatusBadgeStyle(isExpired ? 'vencido' : days <= thresholds.highPriorityDays ? 'prioridade_alta' : 'atencao');

                return (
                  <tr key={batch.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{product.category === 'medicamento' ? 'Medicamento' : 'Material'}</span>
                        {product.code && (
                          <>
                            <span>·</span>
                            <span>{product.code}</span>
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

                    <td className="py-3 px-3 font-mono tabular-nums text-slate-800">
                      {formatDateBR(batch.expirationDate)}
                    </td>

                    <td className="py-3 px-3 font-mono tabular-nums font-semibold">
                      {isExpired ? (
                        <span className="text-rose-700">Vencido há {Math.abs(days)}d</span>
                      ) : (
                        <span className={days <= thresholds.highPriorityDays ? 'text-amber-800' : 'text-slate-700'}>
                          {days} dia{days !== 1 ? 's' : ''}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
                        {style.tag}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-[140px] truncate" title={batch.storageLocation || product.storageLocation}>
                      {batch.storageLocation || product.storageLocation}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isExpired ? (
                        <span className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded">
                          Segregar p/ descarte
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenDispense(batch, product)}
                            className="px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded transition-colors border border-teal-200"
                            title="Dispensar lote prioritário (FEFO)"
                          >
                            Dispensar
                          </button>
                          <button
                            onClick={() => onOpenRelocate(batch, product)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            title="Remanejar para outra UBS"
                          >
                            Remanejar
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
      </div>

      {/* Notice about demo data */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Ambiente de Demonstração & Treinamento da UBS:</span>{' '}
          Os registros exibidos são fictícios para simulação de fluxo real de trabalho na Atenção Básica de Saúde. Todos os cálculos de dias restantes consideram a data atual do sistema ({new Date().toLocaleDateString('pt-BR')}) com persistência local no navegador.
        </div>
      </div>

    </div>
  );
};
