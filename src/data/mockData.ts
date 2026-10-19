import { Product, Batch, UBS, UserOperator, AlertThresholds, AuditLog } from '../types';

export const INITIAL_UBS_LIST: UBS[] = [
  {
    id: 'ubs-1',
    name: 'UBS Jardim das Flores - Dr. Nelson Miranda',
    cnes: '2078412',
    district: 'Zona Norte',
    city: 'São Paulo - SP'
  },
  {
    id: 'ubs-2',
    name: 'UBS Vila Esperança',
    cnes: '3190845',
    district: 'Distrito Leste',
    city: 'São Paulo - SP'
  },
  {
    id: 'ubs-3',
    name: 'UBS Central Integrada',
    cnes: '1045239',
    district: 'Centro',
    city: 'São Paulo - SP'
  }
];

export const INITIAL_OPERATORS: UserOperator[] = [
  {
    id: 'usr-1',
    name: 'Dra. Camila Rocha',
    role: 'Farmacêutica Responsável Técnica',
    registration: 'CRF/SP 48.912'
  },
  {
    id: 'usr-2',
    name: 'Lucas Peixoto',
    role: 'Técnico em Farmácia Hospitalar/UBS',
    registration: 'CRF/SP-TEC 12.804'
  },
  {
    id: 'usr-3',
    name: 'Enfª Beatriz Mendes',
    role: 'Enfermeira Coordenadora de Atenção Básica',
    registration: 'COREN/SP 234.891'
  },
  {
    id: 'usr-4',
    name: 'Dr. Roberto Silveira',
    role: 'Coordenador de Almoxarifado Central e Insumos',
    registration: 'SES/SMS Matrícula 80.412'
  }
];

export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  highPriorityDays: 30, // 1 a 30 dias
  attentionDays: 60,    // 31 a 60 dias
  monitoringDays: 90    // 61 a 90 dias
};

// Current reference date is October 19, 2026 (2026-10-19)
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    ubsId: 'ubs-1',
    name: 'Amoxicilina 500mg cápsula',
    category: 'medicamento',
    code: 'CATMAT-439201',
    unit: 'Cápsula',
    monthlyConsumption: 1200,
    storageLocation: 'Farmácia Central - Prateleira A2',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-10-15T14:20:00Z'
  },
  {
    id: 'prod-2',
    ubsId: 'ubs-1',
    name: 'Losartana Potássica 50mg comprimido',
    category: 'medicamento',
    code: 'CATMAT-230192',
    unit: 'Comprimido',
    monthlyConsumption: 4500,
    storageLocation: 'Farmácia Central - Prateleira B1',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-09-20T11:00:00Z'
  },
  {
    id: 'prod-3',
    ubsId: 'ubs-1',
    name: 'Insulina NPH Humana 100 UI/ml frasco 10ml',
    category: 'medicamento',
    code: 'CATMAT-109823',
    unit: 'Frasco',
    monthlyConsumption: 18,
    storageLocation: 'Geladeira 01 (Termolábeis 2°C a 8°C)',
    createdAt: '2026-05-15T08:30:00Z',
    updatedAt: '2026-10-10T16:00:00Z'
  },
  {
    id: 'prod-4',
    ubsId: 'ubs-1',
    name: 'Dipirona Sódica 500mg/ml solução gotas 20ml',
    category: 'medicamento',
    code: 'CATMAT-338210',
    unit: 'Frasco',
    monthlyConsumption: 80,
    storageLocation: 'Farmácia Central - Prateleira C3',
    createdAt: '2026-06-12T11:45:00Z',
    updatedAt: '2026-10-01T09:15:00Z'
  },
  {
    id: 'prod-5',
    ubsId: 'ubs-1',
    name: 'Salbutamol Sulfato 100mcg/dose spray oral c/ 200 doses',
    category: 'medicamento',
    code: 'CATMAT-554190',
    unit: 'Frasco spray',
    monthlyConsumption: 35,
    storageLocation: 'Farmácia Central - Prateleira A4',
    createdAt: '2026-04-18T14:10:00Z',
    updatedAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'prod-6',
    ubsId: 'ubs-1',
    name: 'Cefalexina 500mg drágea',
    category: 'medicamento',
    code: 'CATMAT-771239',
    unit: 'Drágea',
    // Not provided to show "Dados insuficientes para estimar risco com confiança"
    monthlyConsumption: undefined,
    storageLocation: 'Farmácia Central - Prateleira A3',
    createdAt: '2026-09-01T15:20:00Z',
    updatedAt: '2026-09-01T15:20:00Z'
  },
  {
    id: 'prod-7',
    ubsId: 'ubs-1',
    name: 'Soro Fisiológico (Cloreto de Sódio 0,9%) frasco 500ml',
    category: 'material',
    code: 'CATMAT-892104',
    unit: 'Frasco',
    monthlyConsumption: 120,
    storageLocation: 'Sala de Curativos - Armário 01',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-08-14T11:30:00Z'
  },
  {
    id: 'prod-8',
    ubsId: 'ubs-1',
    name: 'Luva de Procedimento em Látex Não Estéril Tamanho M',
    category: 'material',
    code: 'CATMAT-910283',
    unit: 'Caixa c/ 100',
    monthlyConsumption: 40,
    storageLocation: 'Almoxarifado Geral - Palete 04',
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-09-15T13:45:00Z'
  },
  {
    id: 'prod-9',
    ubsId: 'ubs-1',
    name: 'Compressa de Gaze Hidrófila Estéril 7,5cm x 7,5cm 8 camadas',
    category: 'material',
    code: 'CATMAT-661902',
    unit: 'Pacote c/ 10',
    monthlyConsumption: 350,
    storageLocation: 'Sala de Curativos - Prateleira B2',
    createdAt: '2026-05-02T13:00:00Z',
    updatedAt: '2026-07-22T09:30:00Z'
  },
  {
    id: 'prod-10',
    ubsId: 'ubs-1',
    name: 'Fita Reagente para Teste de Glicemia Capilar',
    category: 'material',
    code: 'CATMAT-441289',
    unit: 'Frasco c/ 50 tiras',
    monthlyConsumption: 25,
    storageLocation: 'Sala de Triagem / Glicemia - Armário 02',
    createdAt: '2026-06-14T09:00:00Z',
    updatedAt: '2026-10-12T10:15:00Z'
  },
  {
    id: 'prod-11',
    ubsId: 'ubs-1',
    name: 'Álcool Etílico Hidratado 70° INPM frasco 1000ml',
    category: 'material',
    code: 'CATMAT-318920',
    unit: 'Frasco',
    monthlyConsumption: 50,
    storageLocation: 'Sala de Vacinas / Almoxarifado',
    createdAt: '2026-04-10T10:30:00Z',
    updatedAt: '2026-08-30T14:00:00Z'
  },
  {
    id: 'prod-12',
    ubsId: 'ubs-1',
    name: 'Paracetamol 500mg comprimido',
    category: 'medicamento',
    code: 'CATMAT-110294',
    unit: 'Comprimido',
    monthlyConsumption: 3200,
    storageLocation: 'Farmácia Central - Prateleira B3',
    createdAt: '2026-07-15T11:00:00Z',
    updatedAt: '2026-09-10T16:00:00Z'
  }
];

// Batches with realistic dates relative to October 19, 2026
export const INITIAL_BATCHES: Batch[] = [
  // Amoxicilina has 2 batches (demonstrating FEFO: LT-26AMX01 expires in 12 days, LT-26AMX02 expires in 180 days)
  {
    id: 'batch-1',
    productId: 'prod-1',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26AMX01',
    quantity: 350,
    entryDate: '2026-02-10',
    expirationDate: '2026-10-31', // 12 days left (Prioridade Alta)
    storageLocation: 'Farmácia Central - Prateleira A2 (Frente)',
    notes: 'Priorizar dispensação imediata aos pacientes com receita da semana.'
  },
  {
    id: 'batch-2',
    productId: 'prod-1',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26AMX02',
    quantity: 1800,
    entryDate: '2026-08-15',
    expirationDate: '2027-04-30', // ~190 days left (Normal)
    storageLocation: 'Farmácia Central - Prateleira A2 (Fundo)',
    notes: 'Lote de reposição quadrimestral da Secretaria de Saúde.'
  },

  // Losartana 50mg has 2 batches
  {
    id: 'batch-3',
    productId: 'prod-2',
    ubsId: 'ubs-1',
    batchNumber: 'LT-25LOS88',
    quantity: 1200,
    entryDate: '2025-11-20',
    expirationDate: '2026-11-28', // ~40 days left (Atenção)
    storageLocation: 'Farmácia Central - Prateleira B1',
    notes: 'Hipertensos cadastrados no programa Hiperdia.'
  },
  {
    id: 'batch-4',
    productId: 'prod-2',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26LOS03',
    quantity: 6000,
    entryDate: '2026-06-10',
    expirationDate: '2027-10-15', // ~360 days left (Normal)
    storageLocation: 'Farmácia Central - Prateleira B1',
    notes: 'Estoque de segurança da UBS.'
  },

  // Insulina NPH (high risk of loss! quantity: 52 frascos, monthly consumption: 18, expires in 22 days!)
  {
    id: 'batch-5',
    productId: 'prod-3',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26INS-NPH',
    quantity: 52,
    entryDate: '2026-03-01',
    expirationDate: '2026-11-10', // ~22 days left (Prioridade Alta + Risco de Perda Excedente!)
    storageLocation: 'Geladeira 01 (Termolábeis 2°C a 8°C)',
    notes: 'Termolábil. Controle diário de temperatura do termomaximin registrado.'
  },

  // Dipirona Gotas (expires in 75 days -> Monitoramento)
  {
    id: 'batch-6',
    productId: 'prod-4',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26DIP-GT',
    quantity: 110,
    entryDate: '2026-04-10',
    expirationDate: '2027-01-02', // 75 days left (Monitoramento)
    storageLocation: 'Farmácia Central - Prateleira C3',
    notes: 'Consumo estável de pediatria e pronto-atendimento acolhimento.'
  },

  // Salbutamol has 1 EXPIRED batch (expired on 2026-10-05) + 1 regular batch
  {
    id: 'batch-7',
    productId: 'prod-5',
    ubsId: 'ubs-1',
    batchNumber: 'LT-25SALB-09',
    quantity: 8,
    entryDate: '2025-08-15',
    expirationDate: '2026-10-05', // Expired 14 days ago! (Vencido)
    storageLocation: 'Quarentena Farmácia - Caixa de Descarte/Segregação',
    notes: 'Segregado fisicamente na caixa de medicamentos vencidos. Aguardando coleta de resíduos RDC.'
  },
  {
    id: 'batch-8',
    productId: 'prod-5',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26SALB-12',
    quantity: 45,
    entryDate: '2026-09-02',
    expirationDate: '2027-08-20', // Normal
    storageLocation: 'Farmácia Central - Prateleira A4',
    notes: 'Lote recebido sem avarias.'
  },

  // Cefalexina (no consumption data specified)
  {
    id: 'batch-9',
    productId: 'prod-6',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26CEF-500',
    quantity: 480,
    entryDate: '2026-07-20',
    expirationDate: '2026-12-15', // ~57 days left (Atenção)
    storageLocation: 'Farmácia Central - Prateleira A3',
    notes: 'Aguardando validação do perfil epidemiológico da unidade.'
  },

  // Soro Fisiológico (Normal)
  {
    id: 'batch-10',
    productId: 'prod-7',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26SF-500',
    quantity: 240,
    entryDate: '2026-06-18',
    expirationDate: '2027-06-30', // > 200 days (Normal)
    storageLocation: 'Sala de Curativos - Armário 01',
    notes: 'Uso diário nos procedimentos de lavagem de feridas.'
  },

  // Luvas M (2 batches)
  {
    id: 'batch-11',
    productId: 'prod-8',
    ubsId: 'ubs-1',
    batchNumber: 'LT-25LUV-M1',
    quantity: 15,
    entryDate: '2025-10-05',
    expirationDate: '2026-11-05', // ~17 days left (Prioridade Alta)
    storageLocation: 'Almoxarifado Geral - Palete 04',
    notes: 'Caixas com identificação em fita para dispensação preferencial.'
  },
  {
    id: 'batch-12',
    productId: 'prod-8',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26LUV-M2',
    quantity: 90,
    entryDate: '2026-06-12',
    expirationDate: '2028-02-15', // Normal
    storageLocation: 'Almoxarifado Geral - Palete 04',
    notes: 'Lote principal de insumos de proteção individual.'
  },

  // Gaze Estéril
  {
    id: 'batch-13',
    productId: 'prod-9',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26GAZE-EST',
    quantity: 650,
    entryDate: '2026-05-10',
    expirationDate: '2027-11-20', // Normal
    storageLocation: 'Sala de Curativos - Prateleira B2',
    notes: 'Pacotes íntegros e secos.'
  },

  // Fita Reagente Glicemia (28 days left, quantity: 40 frascos, monthly consumption: 25 -> Risco de perda de aprox. 16 frascos!)
  {
    id: 'batch-14',
    productId: 'prod-10',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26GLIC-TIRAS',
    quantity: 42,
    entryDate: '2026-02-28',
    expirationDate: '2026-11-16', // 28 days left (Prioridade Alta + Risco Excedente)
    storageLocation: 'Sala de Triagem / Glicemia - Armário 02',
    notes: 'Fita sensível à umidade. Manter frasco fechado.'
  },

  // Álcool 70%
  {
    id: 'batch-15',
    productId: 'prod-11',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26ALC-70',
    quantity: 38,
    entryDate: '2026-03-15',
    expirationDate: '2027-03-31', // Normal
    storageLocation: 'Sala de Vacinas / Almoxarifado',
    notes: 'Armazenado longe de fontes de calor.'
  },

  // Paracetamol 500mg
  {
    id: 'batch-16',
    productId: 'prod-12',
    ubsId: 'ubs-1',
    batchNumber: 'LT-26PAR-500',
    quantity: 4100,
    entryDate: '2026-06-01',
    expirationDate: '2027-12-10', // Normal
    storageLocation: 'Farmácia Central - Prateleira B3',
    notes: 'Alta rotatividade nas consultas médicas de demanda espontânea.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-18T14:30:00Z',
    ubsId: 'ubs-1',
    userName: 'Dra. Camila Rocha',
    userRole: 'Farmacêutica Responsável Técnica',
    action: 'CADASTRO_PRODUTO',
    productName: 'Cefalexina 500mg drágea',
    batchNumber: 'LT-26CEF-500',
    quantityDelta: 480,
    details: 'Cadastro do produto e inserção de lote inicial via remessa estadual.'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-17T09:15:00Z',
    ubsId: 'ubs-1',
    userName: 'Lucas Peixoto',
    userRole: 'Técnico em Farmácia',
    action: 'DISPENSA_ESTOQUE',
    productName: 'Amoxicilina 500mg cápsula',
    batchNumber: 'LT-26AMX01',
    quantityDelta: -50,
    details: 'Dispensação aos pacientes da UBS seguindo o princípio FEFO (lote mais próximo).'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-15T11:45:00Z',
    ubsId: 'ubs-1',
    userName: 'Dra. Camila Rocha',
    userRole: 'Farmacêutica Responsável Técnica',
    action: 'AJUSTE_ESTOQUE',
    productName: 'Salbutamol Sulfato 100mcg/dose spray oral',
    batchNumber: 'LT-25SALB-09',
    quantityDelta: 0,
    details: 'Segregação do lote vencido para caixa de quarentena. Identificado para descarte.'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-12T16:20:00Z',
    ubsId: 'ubs-1',
    userName: 'Enfª Beatriz Mendes',
    userRole: 'Enfermeira Coordenadora',
    action: 'DISPENSA_ESTOQUE',
    productName: 'Luva de Procedimento em Látex Não Estéril Tamanho M',
    batchNumber: 'LT-25LUV-M1',
    quantityDelta: -10,
    details: 'Abastecimento da Sala de Curativos e Vacinação.'
  }
];
