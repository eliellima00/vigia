import { Product, Batch, AuditLog, LossRiskAnalysis } from '../types';
import { formatDateBR, calculateDaysRemaining, getStatusLabel } from './calculations';

function downloadCSVFile(filename: string, content: string) {
  // UTF-8 BOM so Excel opens PT-BR accents correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInventoryCSV(products: Product[], batches: Batch[], ubsName: string) {
  const headers = [
    'Produto',
    'Categoria',
    'Código Identificação',
    'Lote',
    'Quantidade',
    'Unidade',
    'Data de Entrada',
    'Data de Validade',
    'Dias Restantes',
    'Situação Validade',
    'Local de Armazenamento',
    'Consumo Médio Mensal',
    'UBS'
  ];

  const rows = batches.map(batch => {
    const product = products.find(p => p.id === batch.productId);
    const days = calculateDaysRemaining(batch.expirationDate);
    const statusText = days < 0 ? 'Vencido' : `${days} dias restantes`;
    
    return [
      `"${product?.name || 'Não identificado'}"`,
      `"${product?.category === 'medicamento' ? 'Medicamento' : 'Material / Insumo'}"`,
      `"${product?.code || '-'}"`,
      `"${batch.batchNumber}"`,
      batch.quantity,
      `"${product?.unit || 'Unidade'}"`,
      formatDateBR(batch.entryDate),
      formatDateBR(batch.expirationDate),
      days,
      `"${statusText}"`,
      `"${batch.storageLocation || product?.storageLocation || '-'}"`,
      product?.monthlyConsumption ? product.monthlyConsumption : 'Não informado',
      `"${ubsName}"`
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSVFile(`vigia_estoque_${dateStr}.csv`, csvContent);
}

export function exportExpiringBatchesCSV(products: Product[], batches: Batch[], ubsName: string, maxDays = 90) {
  const headers = [
    'Produto',
    'Categoria',
    'Lote',
    'Quantidade',
    'Unidade',
    'Data de Validade',
    'Dias Restantes',
    'Localização',
    'Recomendação FEFO',
    'UBS'
  ];

  const relevantBatches = batches.filter(b => {
    const days = calculateDaysRemaining(b.expirationDate);
    return days >= 0 && days <= maxDays;
  });

  const rows = relevantBatches.map(batch => {
    const product = products.find(p => p.id === batch.productId);
    const days = calculateDaysRemaining(batch.expirationDate);

    return [
      `"${product?.name || 'Não identificado'}"`,
      `"${product?.category === 'medicamento' ? 'Medicamento' : 'Material'}"`,
      `"${batch.batchNumber}"`,
      batch.quantity,
      `"${product?.unit || 'Unidade'}"`,
      formatDateBR(batch.expirationDate),
      days,
      `"${batch.storageLocation || product?.storageLocation || '-'}"`,
      `"Priorizar dispensação imediata (FEFO)"`,
      `"${ubsName}"`
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSVFile(`vigia_lotes_proximos_vencimento_${dateStr}.csv`, csvContent);
}

export function exportExpiredBatchesCSV(products: Product[], batches: Batch[], ubsName: string) {
  const headers = [
    'Produto',
    'Categoria',
    'Lote',
    'Quantidade Segregada',
    'Unidade',
    'Data de Validade',
    'Dias Vencido',
    'Local de Armazenamento / Quarentena',
    'Finalidade',
    'UBS'
  ];

  const expiredBatches = batches.filter(b => calculateDaysRemaining(b.expirationDate) < 0);

  const rows = expiredBatches.map(batch => {
    const product = products.find(p => p.id === batch.productId);
    const days = calculateDaysRemaining(batch.expirationDate);

    return [
      `"${product?.name || 'Não identificado'}"`,
      `"${product?.category === 'medicamento' ? 'Medicamento' : 'Material'}"`,
      `"${batch.batchNumber}"`,
      batch.quantity,
      `"${product?.unit || 'Unidade'}"`,
      formatDateBR(batch.expirationDate),
      Math.abs(days),
      `"${batch.storageLocation || 'Quarentena'}"`,
      `"Termo de Descarte / Coleta RSS"`,
      `"${ubsName}"`
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSVFile(`vigia_lotes_vencidos_descarte_${dateStr}.csv`, csvContent);
}

export function exportRiskAnalysisCSV(riskList: LossRiskAnalysis[], ubsName: string) {
  const headers = [
    'Produto',
    'Categoria',
    'Estoque Total',
    'Lote Mais Próximo',
    'Validade Mais Próxima',
    'Dias Restantes',
    'Consumo Médio Mensal',
    'Consumo Estimado até Validade',
    'Excedente em Risco',
    'Nível de Risco',
    'Ação Recomendada',
    'UBS'
  ];

  const rows = riskList.map(r => {
    const actionText = r.potentialSurplusRisk && r.potentialSurplusRisk > 0
      ? 'Remanejamento para outra UBS ou aceleração de prescrição'
      : r.hasSufficientData ? 'Consumo absorve o estoque atual' : 'Cadastrar consumo médio mensal';

    return [
      `"${r.productName}"`,
      `"${r.category === 'medicamento' ? 'Medicamento' : 'Material'}"`,
      r.totalQuantity,
      `"${r.earliestBatch.batchNumber}"`,
      formatDateBR(r.earliestBatch.expirationDate),
      r.daysRemaining,
      r.monthlyConsumption || 'Não informado',
      r.estimatedConsumptionUntilExpiry ?? '-',
      r.potentialSurplusRisk ?? '-',
      `"${r.riskLevel.toUpperCase()}"`,
      `"${actionText}"`,
      `"${ubsName}"`
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSVFile(`vigia_analise_risco_perda_${dateStr}.csv`, csvContent);
}

export function exportAuditLogsCSV(logs: AuditLog[], ubsName: string) {
  const headers = [
    'Data e Hora',
    'Usuário Responsável',
    'Cargo / Registro',
    'Ação Realizada',
    'Produto / Insumo',
    'Lote',
    'Variação Quantidade',
    'Detalhes e Justificativa',
    'UBS'
  ];

  const rows = logs.map(l => {
    return [
      `"${new Date(l.timestamp).toLocaleString('pt-BR')}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.productName}"`,
      `"${l.batchNumber || '-'}"`,
      l.quantityDelta !== undefined ? l.quantityDelta : '-',
      `"${l.details.replace(/"/g, '""')}"`,
      `"${ubsName}"`
    ].join(';');
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSVFile(`vigia_auditoria_historico_${dateStr}.csv`, csvContent);
}
