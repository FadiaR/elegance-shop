import type { Product, AppSettings, Sale } from '../types';
import { formatEUR, formatDZD } from '../utils/format';
import { exportProductsToCSV } from '../utils/csv';
import {
  Package,
  TrendingUp,
  Download,
  Euro,
  DollarSign,
  ShoppingBag,
  BarChart3,
  ShoppingCart,
  User,
  Clock,
} from 'lucide-react';

interface Props {
  products: Product[];
  sales: Sale[];
  settings: AppSettings;
}

export default function Dashboard({ products, sales, settings }: Props) {
  const totalProducts = products.length;
  const totalQuantity = products.reduce((s, p) => s + p.quantity, 0);
  const totalPurchaseEur = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
  const totalSellingEur = products.reduce((s, p) => s + p.sellingPrice * p.quantity, 0);
  const potentialProfitEur = totalSellingEur - totalPurchaseEur;

  // Real profit from sales
  const totalRealProfit = sales.reduce((s, sale) => s + sale.realProfit, 0);
  const totalSalesRevenue = sales.reduce((s, sale) => s + sale.actualPrice * sale.quantity, 0);
  const totalSoldItems = sales.reduce((s, sale) => s + sale.quantity, 0);

  const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean);

  const topProfitProducts = [...products]
    .sort((a, b) => {
      const profitA = (a.sellingPrice - a.purchasePrice) * a.quantity;
      const profitB = (b.sellingPrice - b.purchasePrice) * b.quantity;
      return profitB - profitA;
    })
    .slice(0, 5);

  const recentSales = sales.slice(0, 5);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "A l'instant";
    if (diffMin < 60) return `${diffMin} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Tableau de bord</h2>
        <button
          onClick={() => exportProductsToCSV(products, settings.exchangeRate)}
          className="flex items-center gap-2 bg-violet-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
          disabled={products.length === 0}
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Package className="w-5 h-5 text-violet-600" />}
          label="Produits"
          value={`${totalProducts} ref.`}
          sub={`${totalQuantity} articles`}
          color="bg-violet-50 border-violet-200"
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
          label="Marques"
          value={`${brands.length}`}
          sub={brands.slice(0, 3).join(', ') || '-'}
          color="bg-blue-50 border-blue-200"
        />
        <StatCard
          icon={<Euro className="w-5 h-5 text-green-600" />}
          label="Investissement"
          value={formatEUR(totalPurchaseEur)}
          sub={formatDZD(totalPurchaseEur * settings.exchangeRate)}
          color="bg-green-50 border-green-200"
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 text-orange-600" />}
          label="Ventes"
          value={`${totalSoldItems} vendus`}
          sub={`${sales.length} transactions`}
          color="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Profit banners */}
      <div className="space-y-3">
        {/* Potential profit */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Benefice potentiel (stock)</span>
          </div>
          <div className="text-2xl font-bold">{formatEUR(potentialProfitEur)}</div>
          <div className="text-violet-200 text-sm">{formatDZD(potentialProfitEur * settings.exchangeRate)}</div>
          <div className="text-violet-200 text-xs mt-1">
            Base sur les prix affiches du stock restant
          </div>
        </div>

        {/* Real profit */}
        <div className={`rounded-xl p-4 text-white shadow-lg ${
          totalRealProfit >= 0
            ? 'bg-gradient-to-r from-green-600 to-emerald-600'
            : 'bg-gradient-to-r from-red-600 to-rose-600'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5" />
            <span className="font-semibold">Benefice reel (ventes)</span>
          </div>
          <div className="text-2xl font-bold">{formatEUR(totalRealProfit)}</div>
          <div className="text-white/70 text-sm">{formatDZD(totalRealProfit * settings.exchangeRate)}</div>
          <div className="text-white/70 text-xs mt-1">
            Chiffre d'affaires: {formatEUR(totalSalesRevenue)}
          </div>
        </div>
      </div>

      {/* Recent sales */}
      {recentSales.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Dernieres ventes
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentSales.map((sale) => (
              <div key={sale.id} className="px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {sale.quantity}x {sale.productName}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {sale.soldBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(sale.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className={`text-sm font-bold ${sale.realProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {sale.realProfit >= 0 ? '+' : ''}{formatEUR(sale.realProfit)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatEUR(sale.actualPrice)}/u
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top profitable products */}
      {topProfitProducts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Top produits rentables
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {topProfitProducts.map((p, i) => {
              const profit = (p.sellingPrice - p.purchasePrice) * p.quantity;
              return (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="text-sm font-bold text-violet-600 w-5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-500">{p.brand}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatEUR(profit)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDZD(profit * settings.exchangeRate)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Aucun produit</p>
          <p className="text-sm">
            Ajoutez votre premier produit pour commencer
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 truncate">{sub}</div>
    </div>
  );
}
