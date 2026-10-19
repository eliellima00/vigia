export type ProductCategory = 'medicamento' | 'material';

export interface UBS {
  id: string;
  name: string;
  cnes: string;
  district: string;
  city: string;
}

export interface Product {
  id: string;
  ubsId: string;
  name: string;
  category: ProductCategory;
  code?: string; // Código CATMAT / SUS / Interno
  unit: string; // Comprimido, Frasco, Ampola, Caixa, etc.
  monthlyConsumption?: number; // Consumo médio mensal
  storageLocation: string; // Ex: Farmácia Central, Geladeira 01 (Termolábeis)
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  ubsId: string;
  batchNumber: string;
  quantity: number;
  entryDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  storageLocation: string;
  notes?: string;
}

export type ExpirationStatus = 
  | 'vencido' 
  | 'prioridade_alta' 
  | 'atencao' 
  | 'monitoramento' 
  | 'normal';

export interface AlertThresholds {
  highPriorityDays: number; // Ex: 30 (1 a 30 dias)
  attentionDays: number;    // Ex: 60 (31 a 60 dias)
  monitoringDays: number;   // Ex: 90 (61 a 90 dias)
}

export interface AuditLog {
  id: string;
  timestamp: string;
  ubsId: string;
  userName: string;
  userRole: string;
  action: 
    | 'CADASTRO_PRODUTO'
    | 'NOVO_LOTE'
    | 'EDICAO_LOTE'
    | 'DISPENSA_ESTOQUE'
    | 'AJUSTE_ESTOQUE'
    | 'REMANEJAMENTO'
    | 'EXCLUSAO_LOTE'
    | 'EXCLUSAO_PRODUTO';
  productName: string;
  batchNumber?: string;
  quantityDelta?: number;
  details: string;
}

export interface UserOperator {
  id: string;
  name: string;
  role: string;
  registration: string; // Ex: CRF/SP 48.912 ou Coren
}

export interface LossRiskAnalysis {
  productId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  storageLocation: string;
  totalQuantity: number;
  earliestBatch: Batch;
  daysRemaining: number;
  monthsRemaining: number;
  monthlyConsumption?: number;
  estimatedConsumptionUntilExpiry?: number;
  potentialSurplusRisk?: number;
  hasSufficientData: boolean;
  status: ExpirationStatus;
  riskLevel: 'critico' | 'moderado' | 'baixo' | 'indeterminado';
}
