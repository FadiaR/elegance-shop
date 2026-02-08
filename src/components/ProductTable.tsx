import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, AppSettings, SortField, SortConfig } from '../types';
import { formatEUR, formatDZD } from '../utils/format';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Filter,
  Package,
  User,
  ShoppingCart,
  Truck,
} from 'lucide-react';

interface Props {
  products: Product[];
  settings: AppSettings;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onSell: (product: Product) => void;
}

export default function ProductTable({
  products,
  settings,
  onDelete,
  onEdit,
  onSell,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean).sort();
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();

  const filtered = products
    .filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = !brandFilter || p.brand === brandFilter;
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      return matchesSearch && matchesBrand && matchesCategory;
    })
    .sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      switch (sort.field) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'brand':
          return dir * a.brand.localeCompare(b.brand);
        case 'category':
          return dir * a.category.localeCompare(b.category);
        case 'quantity':
          return dir * (a.quantity - b.quantity);
        case 'purchasePrice':
          return dir * (a.purchasePrice - b.purchasePrice);
        case 'sellingPrice':
          return dir * (a.sellingPrice - b.sellingPrice);
        case 'profit': {
          const profitA = a.sellingPrice - a.purchasePrice - (a.shippingCost || 0);
          const profitB = b.sellingPrice - b.purchasePrice - (b.shippingCost || 0);
          return dir * (profitA - profitB);
        }
        default:
          return 0;
      }
    });

  const toggleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' },
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sort.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-violet-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-violet-600" />
    );
  };

  // Totals
  const totalQty = filtered.reduce((s, p) => s + p.quantity, 0);
  const totalCostEur = filtered.reduce((s, p) => s + (p.purchasePrice + (p.shippingCost || 0)) * p.quantity, 0);
  const totalSellingEur = filtered.reduce((s, p) => s + p.sellingPrice * p.quantity, 0);
  const totalProfitEur = totalSellingEur - totalCostEur;
  const totalProfitDzd = totalProfitEur * settings.exchangeRate;

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold text-gray-800">Inventaire</h2>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm text-gray-800"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-lg border transition-colors ${
            showFilters || brandFilter || categoryFilter
              ? 'bg-violet-100 border-violet-300 text-violet-700'
              : 'border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-2">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Toutes les categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {(
          [
            ['name', 'Nom'],
            ['brand', 'Marque'],
            ['quantity', 'Qte'],
            ['purchasePrice', 'Achat'],
            ['sellingPrice', 'Vente'],
            ['profit', 'Benef.'],
          ] as [SortField, string][]
        ).map(([field, label]) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              sort.field === field
                ? 'bg-violet-100 text-violet-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            <SortIcon field={field} />
          </button>
        ))}
      </div>

      {/* Product cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucun produit trouve</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => {
            const totalCostUnit = product.purchasePrice + (product.shippingCost || 0);
            const profitUnit = product.sellingPrice - totalCostUnit;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="flex">
                  {/* Photo */}
                  {product.photo && (
                    <div className="w-24 h-24 shrink-0 bg-gray-100">
                      <img
                        src={product.photo}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <span className="text-xs text-violet-600 font-medium">
                            {product.brand}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          product.quantity === 0
                            ? 'bg-red-100 text-red-700'
                            : product.quantity <= settings.lowStockThreshold
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {product.quantity === 0
                          ? 'Rupture'
                          : `Qte: ${product.quantity}`}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {(product.addedBy || product.lastModifiedBy) && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400">
                            {product.lastModifiedBy || product.addedBy}
                          </span>
                        </span>
                      )}
                      {!!product.shippingCost && (
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400">
                            {formatEUR(product.shippingCost)}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-gray-400">Achat</span>
                        <div className="font-medium text-gray-700">
                          {formatEUR(product.purchasePrice)}
                        </div>
                        <div className="text-gray-400">
                          {formatDZD(product.purchasePrice * settings.exchangeRate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Vente</span>
                        <div className="font-medium text-gray-700">
                          {formatEUR(product.sellingPrice)}
                        </div>
                        <div className="text-gray-400">
                          {formatDZD(product.sellingPrice * settings.exchangeRate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Benef.</span>
                        <div
                          className={`font-bold ${profitUnit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatEUR(profitUnit)}
                        </div>
                        <div className="text-gray-400">
                          {formatDZD(profitUnit * settings.exchangeRate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-100">
                  <button
                    onClick={() => onSell(product)}
                    disabled={product.quantity === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-green-600 hover:bg-green-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Vendre
                  </button>
                  <button
                    onClick={() => {
                      onEdit(product);
                      navigate('/add');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
                      deleteConfirm === product.id
                        ? 'bg-red-600 text-white'
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleteConfirm === product.id ? 'Confirmer ?' : 'Supprimer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Totals footer */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Totaux ({filtered.length} ref. / {totalQty} articles)
          </h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Cout total</span>
              <div className="font-semibold text-gray-800">
                {formatEUR(totalCostEur)}
              </div>
              <div className="text-xs text-gray-400">
                {formatDZD(totalCostEur * settings.exchangeRate)}
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Total Vente</span>
              <div className="font-semibold text-gray-800">
                {formatEUR(totalSellingEur)}
              </div>
              <div className="text-xs text-gray-400">
                {formatDZD(totalSellingEur * settings.exchangeRate)}
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Benefice</span>
              <div
                className={`font-bold ${totalProfitEur >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatEUR(totalProfitEur)}
              </div>
              <div className="text-xs text-gray-400">
                {formatDZD(totalProfitDzd)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
