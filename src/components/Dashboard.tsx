import type { Product, AppSettings } from '../types';
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
} from 'lucide-react';

interface Props {
  products: Product[];
  settings: AppSettings;
}

export default function Dashboard({ products, settings }: Props) {
  const totalProducts = products.length;
  const totalQuantity = products.reduce((s, p) => s + p.quantity, 0);
  const totalPurchaseEur = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
  const totalSellingEur = products.reduce((s, p) => s + p.sellingPrice * p.quantity, 0);
  const totalProfitEur = totalSellingEur - totalPurchaseEur;
  const totalProfitDzd = totalProfitEur * settings.exchangeRate;


  const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean);

  const topProfitProducts = [...products]
    .sort((a, b) => {
      const profitA = (a.sellingPrice - a.purchasePrice) * a.quantity;
      const profitB = (b.sellingPrice - b.purchasePrice) * b.quantity;
      return profitB - profitA;
    })
    .slice(0, 5);

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
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          label="Valeur vente"
          value={formatEUR(totalSellingEur)}
          sub={formatDZD(totalSellingEur * settings.exchangeRate)}
          color="bg-emerald-50 border-emerald-200"
        />
      </div>

      {/* Profit banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">Benefice potentiel total</span>
        </div>
        <div className="text-2xl font-bold">{formatEUR(totalProfitEur)}</div>
        <div className="text-violet-200 text-sm">{formatDZD(totalProfitDzd)}</div>
        <div className="text-violet-200 text-xs mt-1">
          Taux: 1 EUR = {settings.exchangeRate.toFixed(2)} DZD
        </div>
      </div>

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
