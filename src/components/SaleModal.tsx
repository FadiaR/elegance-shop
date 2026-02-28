import { useState } from 'react';
import type { Product, AppSettings } from '../types';
import { formatEUR, formatDZD } from '../utils/format';
import { X, ShoppingCart, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';

type Currency = 'EUR' | 'DZD';

interface Props {
  product: Product;
  settings: AppSettings;
  onConfirm: (productId: string, quantity: number, actualPrice: number) => void;
  onClose: () => void;
}

export default function SaleModal({ product, settings, onConfirm, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [actualPrice, setActualPrice] = useState(product.sellingPrice);
  const [currency, setCurrency] = useState<Currency>('DZD');
  const [dzdPrice, setDzdPrice] = useState(Math.round(product.sellingPrice * settings.exchangeRate));

  const totalCost = product.purchasePrice + (product.shippingCost || 0);
  const potentialProfit = (product.sellingPrice - totalCost) * quantity;
  const realProfit = (actualPrice - totalCost) * quantity;
  const priceDiff = actualPrice - product.sellingPrice;

  const handlePriceChange = (value: number, cur: Currency) => {
    if (cur === 'EUR') {
      setActualPrice(value);
      setDzdPrice(Math.round(value * settings.exchangeRate));
    } else {
      setDzdPrice(value);
      setActualPrice(parseFloat((value / settings.exchangeRate).toFixed(2)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 0 && quantity <= product.quantity) {
      onConfirm(product.id, quantity, actualPrice);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-violet-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart className="w-5 h-5" />
            <h3 className="font-bold">Enregistrer une vente</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product info */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
          {product.brand && <p className="text-xs text-violet-600">{product.brand}</p>}
          <div className="flex gap-4 mt-1 text-xs text-gray-500">
            <span>Stock: {product.quantity}</span>
            <span>Prix affiche: {formatEUR(product.sellingPrice)} / {formatDZD(product.sellingPrice * settings.exchangeRate)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantite vendue
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1)))}
                min={1}
                max={product.quantity}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">{product.quantity} disponible(s)</p>
          </div>

          {/* Actual price with currency toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Prix de vente reel / unite
              </label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCurrency('DZD')}
                  className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                    currency === 'DZD'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  DA
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`px-2.5 py-1 text-xs font-semibold transition-colors border-l border-gray-300 ${
                    currency === 'EUR'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  EUR
                </button>
              </div>
            </div>

            {currency === 'DZD' ? (
              <>
                <div className="relative">
                  <input
                    type="number"
                    value={dzdPrice || ''}
                    onChange={(e) => handlePriceChange(Math.max(0, parseInt(e.target.value) || 0), 'DZD')}
                    min={0}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">DA</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  = {formatEUR(actualPrice)}
                </p>
              </>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="number"
                    value={actualPrice || ''}
                    onChange={(e) => handlePriceChange(Math.max(0, parseFloat(e.target.value) || 0), 'EUR')}
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">EUR</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  = {formatDZD(actualPrice * settings.exchangeRate)}
                </p>
              </>
            )}

            {priceDiff !== 0 && (
              <p className={`text-xs mt-1 ${priceDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)} EUR vs prix affiche
              </p>
            )}
          </div>

          {/* Profit comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <TrendingUp className="w-3 h-3" />
                Benef. potentiel
              </div>
              <div className="font-bold text-gray-700">{formatEUR(potentialProfit)}</div>
              <div className="text-xs text-gray-400">{formatDZD(potentialProfit * settings.exchangeRate)}</div>
            </div>
            <div className={`rounded-lg p-3 ${realProfit >= potentialProfit ? 'bg-green-50' : 'bg-amber-50'}`}>
              <div className={`flex items-center gap-1 text-xs mb-1 ${realProfit >= potentialProfit ? 'text-green-600' : 'text-amber-600'}`}>
                {realProfit >= potentialProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                Benef. reel
              </div>
              <div className={`font-bold ${realProfit >= 0 ? (realProfit >= potentialProfit ? 'text-green-700' : 'text-amber-700') : 'text-red-600'}`}>
                {formatEUR(realProfit)}
              </div>
              <div className="text-xs text-gray-400">{formatDZD(realProfit * settings.exchangeRate)}</div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={quantity < 1 || quantity > product.quantity}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            Confirmer la vente
          </button>
        </form>
      </div>
    </div>
  );
}
