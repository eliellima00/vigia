import { Batch, Product, ExpirationStatus, AlertThresholds, LossRiskAnalysis } from '../types';

/**
 * Calculates remaining days from today until the expiration date.
 * Ensures midnight-to-midnight normalization so products on today's date are NOT marked as expired.
 */
export function calculateDaysRemaining(expirationDateStr: string, referenceDate: Date = new Date()): number {
  if (!expirationDateStr) return 0;
  
  // Normalize both dates to midnight UTC to prevent local timezone offsets
  const [year, month, day] = expirationDateStr.split('-').map(Number);
  const expDate = new Date(year, month - 1, day, 23, 59, 59, 999);
  
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Formats YYYY-MM-DD string into Brazilian DD/MM/AAAA format
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '--/--/----';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/**
 * Evaluates the expiration status of a batch based on configurable thresholds
 */
export function getExpirationStatus(
  daysRemaining: number, 
  thresholds: AlertThresholds = { highPriorityDays: 30, attentionDays: 60, monitoringDays: 90 }
): ExpirationStatus {
  if (daysRemaining < 0) {
    return 'vencido';
  }
  if (daysRemaining <= thresholds.highPriorityDays) {
    return 'prioridade_alta';
  }
  if (daysRemaining <= thresholds.attentionDays) {
    return 'atencao';
  }
  if (daysRemaining <= thresholds.monitoringDays) {
    return 'monitoramento';
  }
  return 'normal';
}

export function getStatusLabel(status: ExpirationStatus): string {
  switch (status) {
    case 'vencido':
      return 'Vencido';
    case 'prioridade_alta':
      return 'Prioridade Alta (1 a 30 dias)';
    case 'atencao':
      return 'Atenção (31 a 60 dias)';
    case 'monitoramento':
      return 'Monitoramento (61 a 90 dias)';
    case 'normal':
      return 'Normal (> 90 dias)';
  }
}

export function getStatusBadgeStyle(status: ExpirationStatus): {
  bg: string;
  text: string;
  border: string;
  tag: string;
} {
  switch (status) {
    case 'vencido':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        tag: 'Vencido'
      };
    case 'prioridade_alta':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        tag: 'Prioridade Alta'
      };
    case 'atencao':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        tag: 'Atenção'
      };
    case 'monitoramento':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-200',
        tag: 'Monitoramento'
      };
    case 'normal':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        tag: 'Regular'
      };
  }
}

/**
 * Sorts batches according to FEFO (First Expire, First Out)
 * Earliest expiration date comes first.
 */
export function sortBatchesFEFO(batches: Batch[]): Batch[] {
  return [...batches].sort((a, b) => {
    // Batches with earlier expiration come first
    if (a.expirationDate !== b.expirationDate) {
      return a.expirationDate.localeCompare(b.expirationDate);
    }
    // Tie breaker: older entry date
    return a.entryDate.localeCompare(b.entryDate);
  });
}

/**
 * Computes loss risk analysis for all products with active batches.
 */
export function computeLossRisks(
  products: Product[], 
  batches: Batch[], 
  thresholds: AlertThresholds
): LossRiskAnalysis[] {
  const result: LossRiskAnalysis[] = [];

  for (const product of products) {
    const productBatches = batches.filter(b => b.productId === product.id && b.quantity > 0);
    if (productBatches.length === 0) continue;

    // FEFO: earliest batch
    const sorted = sortBatchesFEFO(productBatches);
    const earliestBatch = sorted[0];
    const daysRemaining = calculateDaysRemaining(earliestBatch.expirationDate);
    const totalQuantity = productBatches.reduce((acc, b) => acc + b.quantity, 0);
    const status = getExpirationStatus(daysRemaining, thresholds);

    const hasSufficientData = typeof product.monthlyConsumption === 'number' && product.monthlyConsumption > 0;

    let monthsRemaining = Math.max(0, daysRemaining / 30.417);
    let estimatedConsumptionUntilExpiry = 0;
    let potentialSurplusRisk = 0;
    let riskLevel: 'critico' | 'moderado' | 'baixo' | 'indeterminado' = 'indeterminado';

    if (daysRemaining < 0) {
      // Already expired
      riskLevel = 'critico';
      potentialSurplusRisk = earliestBatch.quantity;
      estimatedConsumptionUntilExpiry = 0;
    } else if (hasSufficientData && product.monthlyConsumption) {
      estimatedConsumptionUntilExpiry = Math.round(product.monthlyConsumption * monthsRemaining);
      
      // If available quantity exceeds the estimated consumption until expiry, there's a risk of loss
      const surplus = totalQuantity - estimatedConsumptionUntilExpiry;
      potentialSurplusRisk = Math.max(0, surplus);

      if (surplus > 0) {
        if (daysRemaining <= thresholds.highPriorityDays) {
          riskLevel = 'critico';
        } else if (daysRemaining <= thresholds.attentionDays) {
          riskLevel = 'moderado';
        } else {
          riskLevel = 'baixo';
        }
      } else {
        riskLevel = 'baixo';
      }
    } else {
      // No consumption data available
      riskLevel = 'indeterminado';
    }

    result.push({
      productId: product.id,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      storageLocation: earliestBatch.storageLocation || product.storageLocation,
      totalQuantity,
      earliestBatch,
      daysRemaining,
      monthsRemaining: Number(monthsRemaining.toFixed(1)),
      monthlyConsumption: product.monthlyConsumption,
      estimatedConsumptionUntilExpiry,
      potentialSurplusRisk,
      hasSufficientData,
      status,
      riskLevel
    });
  }

  // Sort by risk priority: critico > moderado > indeterminado > baixo
  const priorityOrder = { critico: 0, moderado: 1, indeterminado: 2, baixo: 3 };
  return result.sort((a, b) => {
    if (priorityOrder[a.riskLevel] !== priorityOrder[b.riskLevel]) {
      return priorityOrder[a.riskLevel] - priorityOrder[b.riskLevel];
    }
    return a.daysRemaining - b.daysRemaining;
  });
}
