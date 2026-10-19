import React, { useState, useMemo, useEffect } from 'react';
import { 
  Header, 
  ActiveTab 
} from './components/Header';
import { ContextBar } from './components/ContextBar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { AlertsView } from './components/AlertsView';
import { RiskAnalysisView } from './components/RiskAnalysisView';
import { ReportsView } from './components/ReportsView';
import { ProductFormModal } from './components/ProductFormModal';
import { DispenseModal } from './components/DispenseModal';
import { RelocateModal } from './components/RelocateModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Product, 
  Batch, 
  AuditLog, 
  AlertThresholds, 
  UBS, 
  UserOperator,
  ProductCategory 
} from './types';
import { 
  getInitialState, 
  saveStoredData, 
  resetDemoData, 
  KEYS 
} from './utils/storage';
import { 
  calculateDaysRemaining, 
  computeLossRisks,
  formatDateBR 
} from './utils/calculations';
import { exportInventoryCSV } from './utils/export';
import { Check, Info } from 'lucide-react';

export default function App() {
  // Initialize state from storage or default dataset
  const initialState = useMemo(() => getInitialState(), []);

  const [products, setProducts] = useState<Product[]>(initialState.products);
  const [batches, setBatches] = useState<Batch[]>(initialState.batches);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialState.auditLogs);
  const [thresholds, setThresholds] = useState<AlertThresholds>(initialState.thresholds);
  const [ubsList, setUbsList] = useState<UBS[]>(initialState.ubsList);
  const [activeUbsId, setActiveUbsId] = useState<string>(initialState.activeUbsId);
  const [operators, setOperators] = useState<UserOperator[]>(initialState.operators);
  const [activeOperatorId, setActiveOperatorId] = useState<string>(initialState.activeOperatorId);

  // Active navigation view
  const [activeTab, setActiveTab] = useState<ActiveTab>('painel');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<{ batch: Batch; product: Product } | null>(null);
  
  const [dispenseTarget, setDispenseTarget] = useState<{ batch: Batch; product: Product } | null>(null);
  const [relocateTarget, setRelocateTarget] = useState<{ batch: Batch; product: Product } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ batch: Batch; product: Product } | null>(null);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveStoredData(KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveStoredData(KEYS.BATCHES, batches);
  }, [batches]);

  useEffect(() => {
    saveStoredData(KEYS.AUDIT_LOGS, auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveStoredData(KEYS.THRESHOLDS, thresholds);
  }, [thresholds]);

  useEffect(() => {
    saveStoredData(KEYS.UBS_LIST, ubsList);
  }, [ubsList]);

  useEffect(() => {
    saveStoredData(KEYS.ACTIVE_UBS, activeUbsId);
  }, [activeUbsId]);

  useEffect(() => {
    saveStoredData(KEYS.OPERATORS, operators);
  }, [operators]);

  useEffect(() => {
    saveStoredData(KEYS.ACTIVE_OPERATOR, activeOperatorId);
  }, [activeOperatorId]);

  // Derived current entities
  const activeUbs = useMemo(() => {
    return ubsList.find(u => u.id === activeUbsId) || ubsList[0];
  }, [ubsList, activeUbsId]);

  const activeOperator = useMemo(() => {
    return operators.find(o => o.id === activeOperatorId) || operators[0];
  }, [operators, activeOperatorId]);

  // Filter products and batches for the active UBS
  const currentUbsProducts = useMemo(() => {
    return products.filter(p => p.ubsId === activeUbs.id);
  }, [products, activeUbs.id]);

  const currentUbsBatches = useMemo(() => {
    return batches.filter(b => b.ubsId === activeUbs.id);
  }, [batches, activeUbs.id]);

  // Urgent alerts count for header badge
  const urgentAlertCount = useMemo(() => {
    return currentUbsBatches.filter(b => {
      const days = calculateDaysRemaining(b.expirationDate);
      return (days <= thresholds.highPriorityDays) && b.quantity > 0;
    }).length;
  }, [currentUbsBatches, thresholds.highPriorityDays]);

  // Loss Risk List
  const riskList = useMemo(() => {
    return computeLossRisks(currentUbsProducts, currentUbsBatches, thresholds);
  }, [currentUbsProducts, currentUbsBatches, thresholds]);

  // Audit Logger helper
  const addAuditLog = (
    action: AuditLog['action'], 
    productName: string, 
    details: string, 
    batchNumber?: string, 
    quantityDelta?: number
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ubsId: activeUbs.id,
      userName: activeOperator.name,
      userRole: `${activeOperator.role} (${activeOperator.registration})`,
      action,
      productName,
      batchNumber,
      quantityDelta,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handler: Save or Update Product & Batch
  const handleSaveProductAndBatch = (data: {
    isExistingProduct: boolean;
    productId?: string;
    productName: string;
    category: ProductCategory;
    code?: string;
    unit: string;
    monthlyConsumption?: number;
    storageLocation: string;
    batchId?: string;
    batchNumber: string;
    quantity: number;
    entryDate: string;
    expirationDate: string;
    batchLocation: string;
    notes?: string;
  }) => {
    const nowISO = new Date().toISOString();
    let targetProductId = data.productId;

    // 1. If new product, create it
    if (!data.isExistingProduct || !targetProductId) {
      targetProductId = `prod-${Date.now()}`;
      const newProduct: Product = {
        id: targetProductId,
        ubsId: activeUbs.id,
        name: data.productName,
        category: data.category,
        code: data.code,
        unit: data.unit,
        monthlyConsumption: data.monthlyConsumption,
        storageLocation: data.storageLocation,
        createdAt: nowISO,
        updatedAt: nowISO,
      };
      setProducts(prev => [newProduct, ...prev]);
      addAuditLog(
        'CADASTRO_PRODUTO',
        data.productName,
        `Novo produto cadastrado na UBS ${activeUbs.name}. Unidade: ${data.unit}.`
      );
    } else {
      // Update existing product metadata if editing
      setProducts(prev => prev.map(p => {
        if (p.id === targetProductId) {
          return {
            ...p,
            name: data.productName,
            category: data.category,
            code: data.code,
            unit: data.unit,
            monthlyConsumption: data.monthlyConsumption,
            storageLocation: data.storageLocation,
            updatedAt: nowISO,
          };
        }
        return p;
      }));
    }

    // 2. Batch Creation or Update
    if (data.batchId) {
      // Editing existing batch
      setBatches(prev => prev.map(b => {
        if (b.id === data.batchId) {
          return {
            ...b,
            batchNumber: data.batchNumber,
            quantity: data.quantity,
            entryDate: data.entryDate,
            expirationDate: data.expirationDate,
            storageLocation: data.batchLocation,
            notes: data.notes,
          };
        }
        return b;
      }));
      addAuditLog(
        'EDICAO_LOTE',
        data.productName,
        `Edição de lote ${data.batchNumber}. Validade: ${formatDateBR(data.expirationDate)}, Saldo: ${data.quantity}.`,
        data.batchNumber
      );
      showToast(`Lote ${data.batchNumber} atualizado com sucesso!`);
    } else {
      // Creating new batch
      const newBatch: Batch = {
        id: `batch-${Date.now()}`,
        productId: targetProductId,
        ubsId: activeUbs.id,
        batchNumber: data.batchNumber,
        quantity: data.quantity,
        entryDate: data.entryDate,
        expirationDate: data.expirationDate,
        storageLocation: data.batchLocation,
        notes: data.notes,
      };
      setBatches(prev => [newBatch, ...prev]);
      addAuditLog(
        'NOVO_LOTE',
        data.productName,
        `Entrada de novo lote ${data.batchNumber}. Qtd: ${data.quantity} ${data.unit}, Validade: ${formatDateBR(data.expirationDate)}.`,
        data.batchNumber,
        data.quantity
      );
      showToast(`Novo lote ${data.batchNumber} inserido no estoque.`);
    }

    setIsProductModalOpen(false);
    setEditingBatch(null);
  };

  // Handler: Confirm Dispense
  const handleConfirmDispense = (batchId: string, quantityToDispense: number, reason: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    const product = products.find(p => p.id === batch.productId);

    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        return {
          ...b,
          quantity: Math.max(0, b.quantity - quantityToDispense),
        };
      }
      return b;
    }));

    addAuditLog(
      'DISPENSA_ESTOQUE',
      product?.name || 'Medicamento/Insumo',
      `Baixa de ${quantityToDispense} ${product?.unit || 'unidades'} do lote ${batch.batchNumber} (FEFO). Motivo: ${reason}`,
      batch.batchNumber,
      -quantityToDispense
    );

    setDispenseTarget(null);
    showToast(`Dispensação de ${quantityToDispense} un. registrada.`);
  };

  // Handler: Confirm Relocation
  const handleConfirmRelocate = (
    batchId: string, 
    quantityToRelocate: number, 
    targetUbsId: string, 
    justification: string
  ) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    const product = products.find(p => p.id === batch.productId);
    const destUbs = ubsList.find(u => u.id === targetUbsId);

    // Decrease from current batch
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        return {
          ...b,
          quantity: Math.max(0, b.quantity - quantityToRelocate),
        };
      }
      return b;
    }));

    // Ensure product exists in destination UBS or clone it
    let destProduct = products.find(p => p.ubsId === targetUbsId && p.name === product?.name);
    if (!destProduct && product) {
      destProduct = {
        ...product,
        id: `prod-transfer-${Date.now()}`,
        ubsId: targetUbsId,
      };
      setProducts(prev => [...prev, destProduct!]);
    }

    // Add relocated batch to target UBS
    const newTransferredBatch: Batch = {
      id: `batch-transf-${Date.now()}`,
      productId: destProduct ? destProduct.id : batch.productId,
      ubsId: targetUbsId,
      batchNumber: `${batch.batchNumber}-REM`,
      quantity: quantityToRelocate,
      entryDate: new Date().toISOString().slice(0, 10),
      expirationDate: batch.expirationDate,
      storageLocation: `Farmácia Central (${destUbs?.name || 'Destino'})`,
      notes: `Remanejado de ${activeUbs.name}. Justificativa: ${justification}`,
    };
    setBatches(prev => [...prev, newTransferredBatch]);

    addAuditLog(
      'REMANEJAMENTO',
      product?.name || 'Insumo',
      `Transferência de ${quantityToRelocate} un. do lote ${batch.batchNumber} de [${activeUbs.name}] para [${destUbs?.name || 'Outra UBS'}]. Justificativa: ${justification}`,
      batch.batchNumber,
      -quantityToRelocate
    );

    setRelocateTarget(null);
    showToast(`Remanejamento de ${quantityToRelocate} un. enviado para ${destUbs?.name}!`);
  };

  // Handler: Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { batch, product } = deleteTarget;

    // Delete batch
    setBatches(prev => prev.filter(b => b.id !== batch.id));

    // If this was the only batch for the product, check whether to keep or remove product
    const otherBatches = batches.filter(b => b.productId === product.id && b.id !== batch.id);

    addAuditLog(
      'EXCLUSAO_LOTE',
      product.name,
      `Exclusão definitiva do lote ${batch.batchNumber} (${batch.quantity} ${product.unit}). Responsável: ${activeOperator.name}`,
      batch.batchNumber,
      -batch.quantity
    );

    if (otherBatches.length === 0) {
      setProducts(prev => prev.filter(p => p.id !== product.id));
      addAuditLog(
        'EXCLUSAO_PRODUTO',
        product.name,
        `Produto desativado por não possuir outros lotes associados na UBS.`
      );
    }

    setDeleteTarget(null);
    showToast(`Registro do lote ${batch.batchNumber} excluído.`);
  };

  // Handler: Update Monthly Consumption inline
  const handleUpdateMonthlyConsumption = (productId: string, consumption: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          monthlyConsumption: consumption,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    }));
    const product = products.find(p => p.id === productId);
    addAuditLog(
      'AJUSTE_ESTOQUE',
      product?.name || 'Medicamento',
      `Atualização do consumo médio mensal para ${consumption} un./mês.`
    );
    showToast('Consumo médio mensal atualizado! Risco recalculado.');
  };

  // Reset demo dataset
  const handleResetDemo = () => {
    resetDemoData();
    const fresh = getInitialState();
    setProducts(fresh.products);
    setBatches(fresh.batches);
    setAuditLogs(fresh.auditLogs);
    setThresholds(fresh.thresholds);
    setUbsList(fresh.ubsList);
    setActiveUbsId(fresh.activeUbsId);
    setOperators(fresh.operators);
    setActiveOperatorId(fresh.activeOperatorId);
    showToast('Dados de demonstração restaurados com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'cadastro') {
            setEditingBatch(null);
            setIsProductModalOpen(true);
          }
        }}
        onOpenNewProduct={() => {
          setEditingBatch(null);
          setIsProductModalOpen(true);
        }}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        urgentAlertCount={urgentAlertCount}
      />

      {/* Contextual Bar (Multi-UBS and Responsible Operator) */}
      <ContextBar
        ubsList={ubsList}
        activeUbs={activeUbs}
        onSelectUbs={(id) => {
          setActiveUbsId(id);
          showToast(`Alternado para a unidade ${ubsList.find(u => u.id === id)?.name}`);
        }}
        operators={operators}
        activeOperator={activeOperator}
        onSelectOperator={(id) => {
          setActiveOperatorId(id);
          showToast(`Operador ativo alterado: ${operators.find(o => o.id === id)?.name}`);
        }}
        onResetDemo={handleResetDemo}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'painel' && (
          <DashboardView
            products={currentUbsProducts}
            batches={currentUbsBatches}
            thresholds={thresholds}
            activeUbs={activeUbs}
            riskList={riskList}
            onNavigate={(tab) => {
              if (tab === 'cadastro') {
                setEditingBatch(null);
                setIsProductModalOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            onOpenDispense={(batch, product) => setDispenseTarget({ batch, product })}
            onOpenRelocate={(batch, product) => setRelocateTarget({ batch, product })}
          />
        )}

        {activeTab === 'estoque' && (
          <InventoryView
            products={currentUbsProducts}
            batches={currentUbsBatches}
            thresholds={thresholds}
            onOpenNewProduct={() => {
              setEditingBatch(null);
              setIsProductModalOpen(true);
            }}
            onOpenEditBatch={(batch, product) => {
              setEditingBatch({ batch, product });
              setIsProductModalOpen(true);
            }}
            onOpenDeleteBatch={(batch, product) => {
              setDeleteTarget({ batch, product });
            }}
            onOpenDispense={(batch, product) => setDispenseTarget({ batch, product })}
            onOpenRelocate={(batch, product) => setRelocateTarget({ batch, product })}
            onExportCSV={() => exportInventoryCSV(currentUbsProducts, currentUbsBatches, activeUbs.name)}
          />
        )}

        {activeTab === 'alertas' && (
          <AlertsView
            products={currentUbsProducts}
            batches={currentUbsBatches}
            thresholds={thresholds}
            onUpdateThresholds={(newThresh) => {
              setThresholds(newThresh);
              showToast('Parâmetros de alerta atualizados!');
            }}
            onOpenDispense={(batch, product) => setDispenseTarget({ batch, product })}
            onOpenRelocate={(batch, product) => setRelocateTarget({ batch, product })}
          />
        )}

        {activeTab === 'risco' && (
          <RiskAnalysisView
            riskList={riskList}
            products={currentUbsProducts}
            batches={currentUbsBatches}
            activeUbs={activeUbs}
            onUpdateMonthlyConsumption={handleUpdateMonthlyConsumption}
            onOpenRelocate={(batch, product) => setRelocateTarget({ batch, product })}
            onOpenDispense={(batch, product) => setDispenseTarget({ batch, product })}
          />
        )}

        {activeTab === 'relatorios' && (
          <ReportsView
            products={currentUbsProducts}
            batches={currentUbsBatches}
            auditLogs={auditLogs.filter(l => l.ubsId === activeUbs.id)}
            riskList={riskList}
            activeUbs={activeUbs}
            activeOperator={activeOperator}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-800">VIGIA</span>
            <span>·</span>
            <span>Gestão Inteligente de Insumos em Saúde</span>
            <span>·</span>
            <span className="text-slate-400">Menos desperdício. Mais cuidado.</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Conforme diretrizes sanitárias da RDC ANVISA e princípio FEFO para Atenção Básica
          </div>
        </div>
      </footer>

      {/* Modal: Product & Batch Form */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingBatch(null);
        }}
        onSaveProductAndBatch={handleSaveProductAndBatch}
        existingProducts={currentUbsProducts}
        activeUbs={activeUbs}
        editingBatch={editingBatch}
      />

      {/* Modal: Fast Dispensing */}
      <DispenseModal
        isOpen={!!dispenseTarget}
        onClose={() => setDispenseTarget(null)}
        batch={dispenseTarget?.batch || null}
        product={dispenseTarget?.product || null}
        activeOperator={activeOperator}
        onConfirmDispense={handleConfirmDispense}
      />

      {/* Modal: Relocation to another UBS */}
      <RelocateModal
        isOpen={!!relocateTarget}
        onClose={() => setRelocateTarget(null)}
        batch={relocateTarget?.batch || null}
        product={relocateTarget?.product || null}
        ubsList={ubsList}
        currentUbs={activeUbs}
        activeOperator={activeOperator}
        onConfirmRelocate={handleConfirmRelocate}
      />

      {/* Modal: Confirmation for Deletion */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Lote do Estoque?"
        message="Esta ação removerá permanentemente o registro deste lote da base da unidade. O cancelamento ficará registrado no livro de auditoria sanitária com sua identificação profissional."
        itemName={deleteTarget ? `${deleteTarget.product.name} — Lote: ${deleteTarget.batch.batchNumber} (${deleteTarget.batch.quantity} un.)` : ''}
        confirmButtonText="Excluir Lote"
        isDangerous={true}
      />

      {/* Modal: Full Audit Logs */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs.filter(l => l.ubsId === activeUbs.id)}
        activeUbs={activeUbs}
      />

      {/* Modal: System Settings */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        thresholds={thresholds}
        onSaveThresholds={(newThresh) => setThresholds(newThresh)}
        ubsList={ubsList}
        onAddUbs={(newUbs) => {
          const ubs: UBS = {
            ...newUbs,
            id: `ubs-${Date.now()}`,
          };
          setUbsList(prev => [...prev, ubs]);
          showToast(`UBS ${ubs.name} adicionada à rede!`);
        }}
        operators={operators}
        onAddOperator={(newOp) => {
          const op: UserOperator = {
            ...newOp,
            id: `usr-${Date.now()}`,
          };
          setOperators(prev => [...prev, op]);
          showToast(`Profissional ${op.name} cadastrado!`);
        }}
        onResetDemo={handleResetDemo}
      />

    </div>
  );
}
