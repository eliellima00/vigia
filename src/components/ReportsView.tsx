import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Clock, 
  ShieldAlert, 
  Boxes, 
  TrendingDown, 
  History,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Product, Batch, AuditLog, LossRiskAnalysis, UBS, UserOperator } from '../types';
import { formatDateBR, calculateDaysRemaining } from '../utils/calculations';
import { 
  exportExpiringBatchesCSV, 
  exportExpiredBatchesCSV, 
  exportInventoryCSV, 
  exportRiskAnalysisCSV, 
  exportAuditLogsCSV 
} from '../utils/export';

type ReportType = 'proximos' | 'vencidos' | 'estoque' | 'risco' | 'auditoria';

interface ReportsViewProps {
  products: Product[];
  batches: Batch[];
  auditLogs: AuditLog[];
  riskList: LossRiskAnalysis[];
  activeUbs: UBS;
  activeOperator: UserOperator;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  batches,
  auditLogs,
  riskList,
  activeUbs,
  activeOperator,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('proximos');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    switch (selectedReport) {
      case 'proximos':
        exportExpiringBatchesCSV(products, batches, activeUbs.name, 90);
        break;
      case 'vencidos':
        exportExpiredBatchesCSV(products, batches, activeUbs.name);
        break;
      case 'estoque':
        exportInventoryCSV(products, batches, activeUbs.name);
        break;
      case 'risco':
        exportRiskAnalysisCSV(riskList, activeUbs.name);
        break;
      case 'auditoria':
        exportAuditLogsCSV(auditLogs, activeUbs.name);
        break;
    }
  };

  // Data sets for the active report
  const expiringData = batches.filter(b => {
    const days = calculateDaysRemaining(b.expirationDate);
    return days >= 0 && days <= 90 && b.quantity > 0;
  }).sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));

  const expiredData = batches.filter(b => {
    return calculateDaysRemaining(b.expirationDate) < 0 && b.quantity > 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 tracking-wide uppercase">
                Emissão Documental & Auditoria
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{activeUbs.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Relatórios Oficiais de Validade e Estoque
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Consulte e exporte relatórios consolidados em planilha CSV ou formato para impressão e arquivo sanitário da UBS.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar Planilha (CSV)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setSelectedReport('proximos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedReport === 'proximos'
                ? 'bg-teal-800 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>1. Lotes Próximos do Vencimento ({expiringData.length})</span>
          </button>

          <button
            onClick={() => setSelectedReport('vencidos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedReport === 'vencidos'
                ? 'bg-rose-700 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>2. Lotes Vencidos / Termo de Descarte ({expiredData.length})</span>
          </button>

          <button
            onClick={() => setSelectedReport('estoque')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedReport === 'estoque'
                ? 'bg-teal-800 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>3. Estoque Completo por Categoria ({batches.length})</span>
          </button>

          <button
            onClick={() => setSelectedReport('risco')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedReport === 'risco'
                ? 'bg-teal-800 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>4. Análise de Risco de Perda ({riskList.length})</span>
          </button>

          <button
            onClick={() => setSelectedReport('auditoria')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedReport === 'auditoria'
                ? 'bg-teal-800 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>5. Histórico de Alterações / Auditoria ({auditLogs.length})</span>
          </button>

        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs print-area">
        
        {/* Institutional Report Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
                SISTEMA VIGIA · GESTÃO INTELIGENTE DE INSUMOS EM SAÚDE
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {selectedReport === 'proximos' && 'Relatório Técnico: Lotes Próximos do Vencimento (≤ 90 dias)'}
                {selectedReport === 'vencidos' && 'Termo de Segregação e Lotes Vencidos para Descarte (RDC ANVISA)'}
                {selectedReport === 'estoque' && 'Relatório Geral de Posição de Estoque por Categoria e Localização'}
                {selectedReport === 'risco' && 'Relatório de Inteligência: Risco de Perda e Estoque Excedente'}
                {selectedReport === 'auditoria' && 'Livro de Registro de Movimentações e Auditoria de Estoque'}
              </h2>
            </div>
            
            <div className="text-right text-xs text-slate-500">
              <div>Emitido em: <strong className="font-mono">{new Date().toLocaleString('pt-BR')}</strong></div>
              <div>Responsável: <strong className="text-slate-800">{activeOperator.name}</strong> ({activeOperator.registration})</div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{activeUbs.name}</span>
            <span>·</span>
            <span>CNES: <strong className="font-mono">{activeUbs.cnes}</strong></span>
            <span>·</span>
            <span>{activeUbs.district} - {activeUbs.city}</span>
          </div>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          {selectedReport === 'proximos' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-700 font-semibold bg-slate-50">
                  <th className="py-2 px-3">Produto</th>
                  <th className="py-2 px-2">Categoria</th>
                  <th className="py-2 px-2">Lote</th>
                  <th className="py-2 px-2 text-right">Qtd.</th>
                  <th className="py-2 px-2">Data Validade</th>
                  <th className="py-2 px-2">Dias Restantes</th>
                  <th className="py-2 px-3">Localização</th>
                  <th className="py-2 px-3">Conduta Recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expiringData.map(batch => {
                  const product = products.find(p => p.id === batch.productId);
                  if (!product) return null;
                  const days = calculateDaysRemaining(batch.expirationDate);

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">{product.name}</td>
                      <td className="py-2 px-2 capitalize text-slate-600">{product.category}</td>
                      <td className="py-2 px-2 font-mono text-slate-800">{batch.batchNumber}</td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums font-semibold">{batch.quantity} {product.unit}</td>
                      <td className="py-2 px-2 font-mono tabular-nums text-slate-900">{formatDateBR(batch.expirationDate)}</td>
                      <td className="py-2 px-2 font-mono tabular-nums font-bold text-amber-800">{days} dias</td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">{batch.storageLocation || product.storageLocation}</td>
                      <td className="py-2 px-3 text-[11px] font-medium text-teal-900">Priorizar saída FEFO / Remanejar</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedReport === 'vencidos' && (
            <div>
              {expiredData.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum lote vencido registrado na unidade.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-700 font-semibold bg-rose-50/50">
                      <th className="py-2 px-3">Produto</th>
                      <th className="py-2 px-2">Lote</th>
                      <th className="py-2 px-2 text-right">Qtd. Segregada</th>
                      <th className="py-2 px-2">Data Validade</th>
                      <th className="py-2 px-2">Dias Vencido</th>
                      <th className="py-2 px-3">Localização Atual</th>
                      <th className="py-2 px-3">Destinação Sanitária</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {expiredData.map(batch => {
                      const product = products.find(p => p.id === batch.productId);
                      if (!product) return null;
                      const days = calculateDaysRemaining(batch.expirationDate);

                      return (
                        <tr key={batch.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-900">{product.name}</td>
                          <td className="py-2 px-2 font-mono text-slate-800">{batch.batchNumber}</td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums font-bold text-rose-700">{batch.quantity} {product.unit}</td>
                          <td className="py-2 px-2 font-mono tabular-nums text-slate-900">{formatDateBR(batch.expirationDate)}</td>
                          <td className="py-2 px-2 font-mono tabular-nums text-rose-700 font-bold">{Math.abs(days)} dias atrás</td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">{batch.storageLocation || 'Quarentena Farmácia'}</td>
                          <td className="py-2 px-3 text-[11px] text-slate-700">Coleta RSS / Incineração autorizada</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {selectedReport === 'estoque' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-700 font-semibold bg-slate-50">
                  <th className="py-2 px-3">Produto</th>
                  <th className="py-2 px-2">Categoria</th>
                  <th className="py-2 px-2">Código</th>
                  <th className="py-2 px-2">Lote</th>
                  <th className="py-2 px-2 text-right">Qtd.</th>
                  <th className="py-2 px-2">Validade</th>
                  <th className="py-2 px-3">Localização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {batches.map(batch => {
                  const product = products.find(p => p.id === batch.productId);
                  if (!product) return null;

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">{product.name}</td>
                      <td className="py-2 px-2 capitalize text-slate-600">{product.category}</td>
                      <td className="py-2 px-2 font-mono text-slate-500">{product.code || '-'}</td>
                      <td className="py-2 px-2 font-mono text-slate-800">{batch.batchNumber}</td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums font-semibold">{batch.quantity} {product.unit}</td>
                      <td className="py-2 px-2 font-mono tabular-nums text-slate-900">{formatDateBR(batch.expirationDate)}</td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">{batch.storageLocation || product.storageLocation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedReport === 'risco' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-700 font-semibold bg-slate-50">
                  <th className="py-2 px-3">Produto</th>
                  <th className="py-2 px-2 text-right">Estoque Físico</th>
                  <th className="py-2 px-2">Lote Próximo</th>
                  <th className="py-2 px-2">Validade</th>
                  <th className="py-2 px-2 text-right">Média Mensal</th>
                  <th className="py-2 px-2 text-right">Consumo Est.</th>
                  <th className="py-2 px-2 text-right">Excedente em Risco</th>
                  <th className="py-2 px-3">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {riskList.map(item => (
                  <tr key={item.productId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-900">{item.productName}</td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">{item.totalQuantity} {item.unit}</td>
                    <td className="py-2 px-2 font-mono text-slate-800">{item.earliestBatch.batchNumber}</td>
                    <td className="py-2 px-2 font-mono tabular-nums text-slate-900">{formatDateBR(item.earliestBatch.expirationDate)}</td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">{item.monthlyConsumption || 'Não inf.'}</td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums">{item.estimatedConsumptionUntilExpiry ?? '-'}</td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums font-bold text-orange-700">
                      {item.potentialSurplusRisk && item.potentialSurplusRisk > 0 ? `+${item.potentialSurplusRisk} ${item.unit}` : '-'}
                    </td>
                    <td className="py-2 px-3 text-[11px] capitalize font-medium text-slate-700">{item.riskLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'auditoria' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-700 font-semibold bg-slate-50">
                  <th className="py-2 px-3">Data e Hora</th>
                  <th className="py-2 px-2">Profissional / Cargo</th>
                  <th className="py-2 px-2">Operação</th>
                  <th className="py-2 px-2">Produto / Lote</th>
                  <th className="py-2 px-2 text-right">Variação</th>
                  <th className="py-2 px-3">Histórico e Justificativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-semibold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-slate-500">{log.userRole}</div>
                    </td>
                    <td className="py-2 px-2 font-mono text-[10px] font-medium text-teal-800">
                      {log.action}
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-medium text-slate-900">{log.productName}</div>
                      {log.batchNumber && <div className="font-mono text-[10px] text-slate-500">{log.batchNumber}</div>}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums font-semibold">
                      {log.quantityDelta !== undefined ? log.quantityDelta : '-'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Official Signature Footer for Printed Audits */}
        <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 w-3/4 mx-auto mb-2" />
            <p className="font-semibold text-slate-900">{activeOperator.name}</p>
            <p className="text-slate-500">{activeOperator.role} · {activeOperator.registration}</p>
          </div>
          <div>
            <div className="border-b border-slate-400 w-3/4 mx-auto mb-2" />
            <p className="font-semibold text-slate-900">Coordenação de Assistência Farmacêutica</p>
            <p className="text-slate-500">Secretaria Municipal de Saúde</p>
          </div>
        </div>

      </div>

    </div>
  );
};
