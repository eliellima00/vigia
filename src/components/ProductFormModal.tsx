import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, Plus, Layers } from 'lucide-react';
import { Product, Batch, ProductCategory, UBS } from '../types';
import { calculateDaysRemaining, formatDateBR } from '../utils/calculations';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProductAndBatch: (data: {
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
  }) => void;
  existingProducts: Product[];
  activeUbs: UBS;
  editingBatch?: { batch: Batch; product: Product } | null;
}

const COMMON_UNITS = [
  'Comprimido',
  'Frasco',
  'Ampola',
  'Caixa c/ 100',
  'Caixa c/ 50',
  'Pacote c/ 10',
  'Bisnaga',
  'Drágea',
  'Frasco spray',
  'Envelope',
  'Unidade',
];

const COMMON_LOCATIONS = [
  'Farmácia Central - Prateleira A1',
  'Farmácia Central - Prateleira A2',
  'Farmácia Central - Prateleira B1',
  'Farmácia Central - Prateleira B2',
  'Farmácia Central - Prateleira C1',
  'Geladeira 01 (Termolábeis 2°C a 8°C)',
  'Geladeira 02 (Vacinas e Imunobiológicos)',
  'Sala de Vacinas - Armário 01',
  'Sala de Curativos - Armário 01',
  'Sala de Curativos - Prateleira B2',
  'Sala de Triagem / Glicemia - Armário 02',
  'Almoxarifado Geral - Palete 01',
  'Almoxarifado Geral - Palete 04',
  'Dispensário Diário',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSaveProductAndBatch,
  existingProducts,
  activeUbs,
  editingBatch,
}) => {
  const isEditing = !!editingBatch;

  // Mode: new product or add batch to existing product
  const [formMode, setFormMode] = useState<'new_product' | 'existing_product'>('new_product');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Product fields
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('medicamento');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('Comprimido');
  const [monthlyConsumption, setMonthlyConsumption] = useState<string>('');
  const [productLocation, setProductLocation] = useState('Farmácia Central - Prateleira A1');

  // Batch fields
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState<string>('100');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expirationDate, setExpirationDate] = useState('');
  const [batchLocation, setBatchLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Initialize form when opening or editing
  useEffect(() => {
    if (editingBatch) {
      setFormMode('existing_product');
      setSelectedProductId(editingBatch.product.id);
      setProductName(editingBatch.product.name);
      setCategory(editingBatch.product.category);
      setCode(editingBatch.product.code || '');
      setUnit(editingBatch.product.unit);
      setMonthlyConsumption(editingBatch.product.monthlyConsumption ? String(editingBatch.product.monthlyConsumption) : '');
      setProductLocation(editingBatch.product.storageLocation);

      setBatchNumber(editingBatch.batch.batchNumber);
      setQuantity(String(editingBatch.batch.quantity));
      setEntryDate(editingBatch.batch.entryDate);
      setExpirationDate(editingBatch.batch.expirationDate);
      setBatchLocation(editingBatch.batch.storageLocation || editingBatch.product.storageLocation);
      setNotes(editingBatch.batch.notes || '');
    } else {
      setFormMode('new_product');
      setSelectedProductId('');
      setProductName('');
      setCategory('medicamento');
      setCode('');
      setUnit('Comprimido');
      setMonthlyConsumption('');
      setProductLocation('Farmácia Central - Prateleira A1');

      setBatchNumber('');
      setQuantity('100');
      setEntryDate(new Date().toISOString().slice(0, 10));
      setExpirationDate('');
      setBatchLocation('');
      setNotes('');
    }
    setError(null);
  }, [editingBatch, isOpen]);

  // When an existing product is picked in dropdown
  const handleSelectExistingProduct = (id: string) => {
    setSelectedProductId(id);
    const prod = existingProducts.find(p => p.id === id);
    if (prod) {
      setProductName(prod.name);
      setCategory(prod.category);
      setCode(prod.code || '');
      setUnit(prod.unit);
      setMonthlyConsumption(prod.monthlyConsumption ? String(prod.monthlyConsumption) : '');
      setProductLocation(prod.storageLocation);
      if (!batchLocation) {
        setBatchLocation(prod.storageLocation);
      }
    }
  };

  if (!isOpen) return null;

  // Real-time calculation of days until expiration
  const calculatedDays = expirationDate ? calculateDaysRemaining(expirationDate) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isExisting = formMode === 'existing_product' && !!selectedProductId;

    if (!isExisting && !productName.trim()) {
      setError('Por favor, informe o nome do produto.');
      return;
    }

    if (isExisting && !selectedProductId) {
      setError('Por favor, selecione um produto cadastrado.');
      return;
    }

    if (!batchNumber.trim()) {
      setError('Por favor, informe o número do lote (ex: LT-2026A1).');
      return;
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setError('A quantidade deve ser um número inteiro igual ou superior a zero.');
      return;
    }

    if (!expirationDate) {
      setError('Por favor, selecione a data de validade do lote.');
      return;
    }

    if (!entryDate) {
      setError('Por favor, informe a data de entrada do lote na UBS.');
      return;
    }

    const parsedConsumption = monthlyConsumption.trim() ? parseInt(monthlyConsumption, 10) : undefined;
    if (parsedConsumption !== undefined && (isNaN(parsedConsumption) || parsedConsumption < 0)) {
      setError('O consumo médio mensal deve ser um número positivo.');
      return;
    }

    onSaveProductAndBatch({
      isExistingProduct: isExisting,
      productId: isExisting ? selectedProductId : undefined,
      productName: productName.trim(),
      category,
      code: code.trim() || undefined,
      unit: unit.trim(),
      monthlyConsumption: parsedConsumption,
      storageLocation: productLocation,
      batchId: editingBatch?.batch.id,
      batchNumber: batchNumber.trim().toUpperCase(),
      quantity: parsedQty,
      entryDate,
      expirationDate,
      batchLocation: batchLocation.trim() || productLocation,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Editar Lote / Produto' : 'Cadastrar Medicamento ou Insumo'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeUbs.name} · Controle com rastreabilidade de lote e data de validade
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Mode Switcher (New Product vs Add Batch to Existing) */}
          {!isEditing && existingProducts.length > 0 && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setFormMode('new_product');
                  setSelectedProductId('');
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  formMode === 'new_product'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-teal-800" />
                Novo Produto & Primeiro Lote
              </button>

              <button
                type="button"
                onClick={() => setFormMode('existing_product')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  formMode === 'existing_product'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-teal-800" />
                Adicionar Lote a Produto Existente
              </button>
            </div>
          )}

          {/* Section 1: Product Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <span>01. Identificação do Produto</span>
            </h3>

            {/* If selecting existing product */}
            {formMode === 'existing_product' && !isEditing ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Selecione o Produto Cadastrado *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectExistingProduct(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  required
                >
                  <option value="">Selecione um produto da lista...</option>
                  {existingProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category === 'medicamento' ? 'Medicamento' : 'Insumo'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome do Produto / Medicamento *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Amoxicilina 500mg cápsula"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  >
                    <option value="medicamento">Medicamento</option>
                    <option value="material">Material / Insumo</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Código (CATMAT / SUS / Opcional)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: CATMAT-439201"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Unidade de Medida *
                </label>
                <input
                  type="text"
                  list="units-list"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Ex: Comprimido, Frasco"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  required
                />
                <datalist id="units-list">
                  {COMMON_UNITS.map(u => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Consumo Médio Mensal (opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={monthlyConsumption}
                  onChange={(e) => setMonthlyConsumption(e.target.value)}
                  placeholder="Ex: 1200"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Utilizado para calcular risco de perda
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Batch Information */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <span>02. Dados do Lote & Validade</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Número do Lote *
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Ex: LT-26AMX01"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quantidade Disponível *
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 500"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Data de Entrada na UBS *
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Data de Validade (Conferência Visual) *
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  required
                />

                {/* Real-time validation badge */}
                {calculatedDays !== null && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600">
                      Validade: <strong className="font-mono">{formatDateBR(expirationDate)}</strong>
                    </span>
                    <span className="text-slate-300">·</span>
                    {calculatedDays < 0 ? (
                      <span className="text-rose-700 font-semibold">
                        Lote Vencido (há {Math.abs(calculatedDays)} dias)
                      </span>
                    ) : (
                      <span className="text-teal-800 font-medium">
                        {calculatedDays} dias restantes até o vencimento
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Local de Armazenamento na UBS *
                </label>
                <input
                  type="text"
                  list="locations-list"
                  value={batchLocation || productLocation}
                  onChange={(e) => setBatchLocation(e.target.value)}
                  placeholder="Ex: Farmácia Central - Prateleira A1"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  required
                />
                <datalist id="locations-list">
                  {COMMON_LOCATIONS.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Observações Técnicas / Instruções de Conservação (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Manter refrigerado entre 2°C e 8°C. Não congelar."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Salvar Alterações' : 'Salvar Registro'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
