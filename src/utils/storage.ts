import { Product, Batch, AuditLog, AlertThresholds, UBS, UserOperator } from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_BATCHES, 
  INITIAL_AUDIT_LOGS, 
  DEFAULT_ALERT_THRESHOLDS, 
  INITIAL_UBS_LIST, 
  INITIAL_OPERATORS 
} from '../data/mockData';

const KEYS = {
  PRODUCTS: 'vigia_products_v1',
  BATCHES: 'vigia_batches_v1',
  AUDIT_LOGS: 'vigia_audit_logs_v1',
  THRESHOLDS: 'vigia_thresholds_v1',
  UBS_LIST: 'vigia_ubs_list_v1',
  ACTIVE_UBS: 'vigia_active_ubs_id_v1',
  OPERATORS: 'vigia_operators_v1',
  ACTIVE_OPERATOR: 'vigia_active_operator_id_v1',
};

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Erro ao carregar chave ${key} do localStorage`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Erro ao salvar chave ${key} no localStorage`, err);
  }
}

export function getInitialState() {
  const products = loadStoredData<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const batches = loadStoredData<Batch[]>(KEYS.BATCHES, INITIAL_BATCHES);
  const auditLogs = loadStoredData<AuditLog[]>(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  const thresholds = loadStoredData<AlertThresholds>(KEYS.THRESHOLDS, DEFAULT_ALERT_THRESHOLDS);
  const ubsList = loadStoredData<UBS[]>(KEYS.UBS_LIST, INITIAL_UBS_LIST);
  const activeUbsId = loadStoredData<string>(KEYS.ACTIVE_UBS, INITIAL_UBS_LIST[0].id);
  const operators = loadStoredData<UserOperator[]>(KEYS.OPERATORS, INITIAL_OPERATORS);
  const activeOperatorId = loadStoredData<string>(KEYS.ACTIVE_OPERATOR, INITIAL_OPERATORS[0].id);

  return {
    products,
    batches,
    auditLogs,
    thresholds,
    ubsList,
    activeUbsId,
    operators,
    activeOperatorId,
  };
}

export function resetDemoData() {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
  localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(KEYS.THRESHOLDS, JSON.stringify(DEFAULT_ALERT_THRESHOLDS));
  localStorage.setItem(KEYS.UBS_LIST, JSON.stringify(INITIAL_UBS_LIST));
  localStorage.setItem(KEYS.ACTIVE_UBS, JSON.stringify(INITIAL_UBS_LIST[0].id));
  localStorage.setItem(KEYS.OPERATORS, JSON.stringify(INITIAL_OPERATORS));
  localStorage.setItem(KEYS.ACTIVE_OPERATOR, JSON.stringify(INITIAL_OPERATORS[0].id));
}

export { KEYS };
