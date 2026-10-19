import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Boxes, 
  ShieldCheck, 
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, Batch, AlertThresholds, ProductCategory } from '../types';
import { calculateDaysRemaining, formatDateBR, getStatusBadgeStyle, sortBatchesFEFO } from '../utils/calculations';

interface InventoryViewProps {
  products: Product[];
  batches: Batch[];
  thresholds: AlertThresholds;
  onOpenNewProduct: () => void;
  onOpenEditBatch: (batch: Batch, product: Product) => void;
  onOpenDeleteBatch: (batch: Batch, product: Product) => void;
  onOpenDispense: (batch: Batch, product: Product) => void;
  onOpenRelocate: (batch: Batch, product: Product) => void;
  onExportCSV: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  batches,
  thresholds,
  onOpenNewProduct,
  onOpenEditBatch,
  onOpenDeleteBatch,
  onOpenDispense,
  onOpenRelocate,
  onExportCSV,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Extract unique locations for filter
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    batches.forEach(b => {
      if (b.storageLocation) locSet.add(b.storageLocation);
    });
    products.forEach(p => {
      if (p.storageLocation) locSet.add(p.storageLocation);
    });
    return Array.from(locSet).sort();
  }, [batches, products]);

  // Identify FEFO priority batch per product (the earliest active batch for each product)
  const fefoBatchIds = useMemo(() => {
    const map = new Set<string>();
    const grouped = new Map<string, Batch[]>();

    batches.forEach(b => {
      if (b.quantity > 0) {
        const arr = grouped.get(b.productId) || [];
        arr.push(b);
        grouped.set(b.productId, arr);
      }
    });

    grouped.forEach((prodBatches) => {
      const sorted = sortBatchesFEFO(prodBatches);
      if (sorted.length > 0) {
        map.add(sorted[0].id);
      }
    });

    return map;
  }, [batches]);

  // Filter and sort items according to FEFO (first expire, first out)
  const filteredBatches = useMemo(() => {
    return batches
      .filter(batch => {
        const product = products.find(p => p.id === batch.productId);
        if (!product) return false;

        // Search text
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = product.name.toLowerCase().includes(term);
          const matchBatch = batch.batchNumber.toLowerCase().includes(term);
          const matchCode = (product.code || '').toLowerCase().includes(term);
          const matchLoc = (batch.storageLocation || product.storageLocation).toLowerCase().includes(term);
          if (!matchName && !matchBatch && !matchCode && !matchLoc) return false;
        }

        // Category
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Location
        if (selectedLocation !== 'all') {
          const loc = batch.storageLocation || product.storageLocation;
          if (loc !== selectedLocation) return false;
        }

        // Expiration status
        if (selectedStatus !== 'all') {
          const days = calculateDaysRemaining(batch.expirationDate);
          if (selectedStatus === 'vencido' && days >= 0) return false;
          if (selectedStatus === 'prioridade_alta' && (days < 0 || days > thresholds.highPriorityDays)) return false;
          if (selectedStatus === 'atencao' && (days <= thresholds.highPriorityDays || days > thresholds.attentionDays)) return false;
          if (selectedStatus === 'monitoramento' && (days <= thresholds.attentionDays || days > thresholds.monitoringDays)) return false;
          if (selectedStatus === 'normal' && days <= thresholds.monitoringDays) return false;
        }

        return true;
      })
      // Rule: Ordenar os lotes prioritariamente pela data de vencimento mais próxima (FEFO)
      .sort((a, b) => {
        if (a.expirationDate !== b.expirationDate) {
          return a.expirationDate.localeCompare(b.expirationDate);
        }
        return a.entryDate.localeCompare(b.entryDate);
      });
  }, [batches, products, searchTerm, selectedCategory, selectedLocation, selectedStatus, thresholds]);

  return (
    <div className="space-y-5">
      
      {/* Top Header & Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 tracking-wide uppercase">
                Módulo de Dispensação e Armazenamento
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ordenação FEFO Ativa
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Controle Geral de Estoque & Lotes
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Princípio FEFO: Primeiro que Vence, Primeiro que Sai. Evita o esquecimento de lotes antigos no fundo das prateleiras.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onExportCSV}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Planilha CSV</span>
            </button>
            <button
              onClick={onOpenNewProduct}
              className="px-3.5 py-2 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Lote</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por produto, lote, CATMAT..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            >
              <option value="all">Todas as Categorias</option>
              <option value="medicamento">Apenas Medicamentos</option>
              <option value="material">Apenas Materiais / Insumos</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 truncate"
            >
              <option value="all">Todos os Locais de Armazenamento</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Expiration Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            >
              <option value="all">Todas as Situações</option>
              <option value="vencido">Vencido (Urgente)</option>
              <option value="prioridade_alta">Prioridade Alta (1 a {thresholds.highPriorityDays}d)</option>
              <option value="atencao">Atenção ({thresholds.highPriorityDays + 1} a {thresholds.attentionDays}d)</option>
              <option value="monitoramento">Monitoramento ({thresholds.attentionDays + 1} a {thresholds.monitoringDays}d)</option>
              <option value="normal">Normal (&gt; {thresholds.monitoringDays}d)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Exibindo <strong className="text-slate-800 font-mono tabular-nums">{filteredBatches.length}</strong> lote(s) encontrados
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-teal-800 font-medium">
              <span className="inline-block w-2.5 h-2.5 bg-teal-700 rounded-xs" />
              Lote prioritário p/ dispensar (FEFO)
            </span>
          </div>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-sm">Nenhum lote corresponde aos filtros</p>
            <p className="text-xs text-slate-500 mt-1">Experimente limpar a busca ou selecionar outro local/situação.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">FEFO</th>
                  <th className="py-2.5 px-4">Produto & Categoria</th>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3 text-right">Qtd. Disponível</th>
                  <th className="py-2.5 px-3">Data Entrada</th>
                  <th className="py-2.5 px-3">Data Validade</th>
                  <th className="py-2.5 px-3">Prazo Restante</th>
                  <th className="py-2.5 px-3">Local de Armazenamento</th>
                  <th className="py-2.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const product = products.find(p => p.id === batch.productId);
                  if (!product) return null;

                  const days = calculateDaysRemaining(batch.expirationDate);
                  const isExpired = days < 0;
                  const isFefoPriority = fefoBatchIds.has(batch.id) && !isExpired && batch.quantity > 0;
                  const statusKey = isExpired 
                    ? 'vencido' 
                    : days <= thresholds.highPriorityDays 
                    ? 'prioridade_alta' 
                    : days <= thresholds.attentionDays 
                    ? 'atencao' 
                    : days <= thresholds.monitoringDays 
                    ? 'monitoramento' 
                    : 'normal';
                  const style = getStatusBadgeStyle(statusKey);

                  return (
                    <tr 
                      key={batch.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isFefoPriority ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      {/* FEFO Tag */}
                      <td className="py-3 px-4">
                        {isFefoPriority ? (
                          <span 
                            title="Primeiro a vencer para este item. Deve ser dispensado antes dos demais lotes."
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-800 text-white shadow-2xs whitespace-nowrap"
                          >
                            FEFO 1º
                          </span>
                        ) : isExpired ? (
                          <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Bloqueado
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Reserva
                          </span>
                        )}
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{product.category}</span>
                          {product.code && (
                            <>
                              <span>·</span>
                              <span className="font-mono">{product.code}</span>
                            </>
                          )}
                          {product.monthlyConsumption && (
                            <>
                              <span>·</span>
                              <span>Consumo: {product.monthlyConsumption}/mês</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Batch Number */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {batch.batchNumber}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {batch.quantity.toLocaleString('pt-BR')} <span className="text-[11px] font-normal text-slate-500">{product.unit}</span>
                      </td>

                      {/* Entry Date */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-600 text-[11px]">
                        {formatDateBR(batch.entryDate)}
                      </td>

                      {/* Expiration Date */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-900 font-semibold">
                        {formatDateBR(batch.expirationDate)}
                      </td>

                      {/* Days Remaining & Status */}
                      <td className="py-3 px-3">
                        <div className="font-mono tabular-nums font-semibold">
                          {isExpired ? (
                            <span className="text-rose-700">Vencido há {Math.abs(days)}d</span>
                          ) : (
                            <span className={days <= thresholds.highPriorityDays ? 'text-amber-800' : 'text-slate-700'}>
                              {days} dias
                            </span>
                          )}
                        </div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
                          {style.tag}
                        </span>
                      </td>

                      {/* Storage Location */}
                      <td className="py-3 px-3 text-slate-600 text-[11px] max-w-[150px] truncate" title={batch.storageLocation || product.storageLocation}>
                        {batch.storageLocation || product.storageLocation}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Quick Dispense Button */}
                          <button
                            onClick={() => onOpenDispense(batch, product)}
                            disabled={batch.quantity === 0 || isExpired}
                            title={isExpired ? 'Lote vencido não pode ser dispensado aos pacientes' : 'Dispensar / Dar baixa em unidades'}
                            className="px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors border border-teal-200"
                          >
                            Dispensar
                          </button>

                          {/* Relocate to another UBS */}
                          <button
                            onClick={() => onOpenRelocate(batch, product)}
                            disabled={batch.quantity === 0 || isExpired}
                            title="Remanejar para outra UBS"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Batch */}
                          <button
                            onClick={() => onOpenEditBatch(batch, product)}
                            title="Editar lote ou produto"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Batch */}
                          <button
                            onClick={() => onOpenDeleteBatch(batch, product)}
                            title="Excluir registro com confirmação"
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

    </div>
  );
};
