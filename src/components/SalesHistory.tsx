import { useState } from 'react';
import type { Sale, AppSettings } from '../types';
import { formatEUR, formatDZD } from '../utils/format';
import {
  Search,
  User,
  Clock,
  Undo2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Receipt,
  Calendar,
} from 'lucide-react';

type SortField = 'date' | 'product' | 'profit' | 'price' | 'quantity';
type DateFilter = 'all' | 'today' | 'week' | 'month';

interface Props {
  sales: Sale[];
  settings: AppSettings;
  onCancelSale: (saleId: string) => void;
}

export default function SalesHistory({ sales, settings, onCancelSale }: Props) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sort, setSort] = useState<{ field: SortField; direction: 'asc' | 'desc' }>({
    field: 'date',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filtered = sales
    .filter((s) => {
      const matchesSearch =
        !search ||
        s.productName.toLowerCase().includes(search.toLowerCase()) ||
        s.brand.toLowerCase().includes(search.toLowerCase()) ||
        s.soldBy.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (dateFilter === 'all') return true;
      const saleDate = new Date(s.createdAt);
      if (dateFilter === 'today') return saleDate >= startOfDay;
      if (dateFilter === 'week') return saleDate >= startOfWeek;
      if (dateFilter === 'month') return saleDate >= startOfMonth;
      return true;
    })
    .sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      switch (sort.field) {
        case 'date':
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'product':
          return dir * a.productName.localeCompare(b.productName);
        case 'profit':
          return dir * (a.realProfit - b.realProfit);
        case 'price':
          return dir * (a.actualPrice - b.actualPrice);
        case 'quantity':
          return dir * (a.quantity - b.quantity);
        default:
          return 0;
      }
    });

  const totalRevenue = filtered.reduce((s, sale) => s + sale.actualPrice * sale.quantity, 0);
  const totalProfit = filtered.reduce((s, sale) => s + sale.realProfit, 0);
  const totalItems = filtered.reduce((s, sale) => s + sale.quantity, 0);

  const toggleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: field === 'date' ? 'desc' : 'asc' },
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCancel = (saleId: string) => {
    if (cancelConfirm === saleId) {
      onCancelSale(saleId);
      setCancelConfirm(null);
    } else {
      setCancelConfirm(saleId);
      setTimeout(() => setCancelConfirm(null), 3000);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold text-gray-800">Historique des ventes</h2>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher produit, marque, vendeur..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm text-gray-800"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-lg border transition-colors ${
            showFilters || dateFilter !== 'all'
              ? 'bg-violet-100 border-violet-300 text-violet-700'
              : 'border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Date filter */}
      {showFilters && (
        <div className="flex gap-2">
          {([
            ['all', 'Tout'],
            ['today', "Aujourd'hui"],
            ['week', 'Cette semaine'],
            ['month', 'Ce mois'],
          ] as [DateFilter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDateFilter(value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                dateFilter === value
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Sort buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          ['date', 'Date'],
          ['product', 'Produit'],
          ['quantity', 'Qte'],
          ['price', 'Prix'],
          ['profit', 'Benef.'],
        ] as [SortField, string][]).map(([field, label]) => (
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

      {/* Sales list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Receipt className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucune vente trouvee</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {sale.quantity}x {sale.productName}
                    </div>
                    {sale.brand && (
                      <span className="text-xs text-violet-600 font-medium">{sale.brand}</span>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {sale.soldBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(sale.createdAt)} {formatTime(sale.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancel(sale.id)}
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      cancelConfirm === sale.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                    title={cancelConfirm === sale.id ? 'Confirmer annulation' : 'Annuler cette vente'}
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price details */}
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-gray-400">Prix/u</span>
                    <div className="font-medium text-gray-700">{formatEUR(sale.actualPrice)}</div>
                    <div className="text-gray-400">{formatDZD(sale.actualPrice * settings.exchangeRate)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total</span>
                    <div className="font-medium text-gray-700">
                      {formatEUR(sale.actualPrice * sale.quantity)}
                    </div>
                    <div className="text-gray-400">
                      {formatDZD(sale.actualPrice * sale.quantity * settings.exchangeRate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Benefice</span>
                    <div
                      className={`font-bold ${sale.realProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {sale.realProfit >= 0 ? '+' : ''}
                      {formatEUR(sale.realProfit)}
                    </div>
                    <div className="text-gray-400">
                      {formatDZD(sale.realProfit * settings.exchangeRate)}
                    </div>
                  </div>
                </div>

                {/* Price comparison indicator */}
                {sale.actualPrice !== sale.listedPrice && (
                  <div className={`mt-1.5 text-xs ${sale.actualPrice > sale.listedPrice ? 'text-green-600' : 'text-amber-600'}`}>
                    {sale.actualPrice > sale.listedPrice ? 'Vendu au-dessus' : 'Vendu en-dessous'} du prix affiche ({formatEUR(sale.listedPrice)})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals footer */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Totaux ({filtered.length} vente{filtered.length > 1 ? 's' : ''} / {totalItems} article{totalItems > 1 ? 's' : ''})
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Chiffre d'affaires</span>
              <div className="font-semibold text-gray-800">{formatEUR(totalRevenue)}</div>
              <div className="text-xs text-gray-400">
                {formatDZD(totalRevenue * settings.exchangeRate)}
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Benefice total</span>
              <div
                className={`font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {totalProfit >= 0 ? '+' : ''}
                {formatEUR(totalProfit)}
              </div>
              <div className="text-xs text-gray-400">
                {formatDZD(totalProfit * settings.exchangeRate)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
