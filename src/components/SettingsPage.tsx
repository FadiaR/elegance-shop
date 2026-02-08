import { useState } from 'react';
import type { AppSettings } from '../types';
import { formatDZD } from '../utils/format';
import { Save, RefreshCw, Info, User } from 'lucide-react';
import { getStoredUsername, setStoredUsername } from '../hooks/useStore';

interface Props {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export default function SettingsPage({ settings, onSave }: Props) {
  const [exchangeRate, setExchangeRate] = useState(settings.exchangeRate);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    settings.lowStockThreshold,
  );
  const [userName, setUserName] = useState(getStoredUsername());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ exchangeRate, lowStockThreshold });
    if (userName.trim()) {
      setStoredUsername(userName.trim());
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-bold text-gray-800">Reglages</h2>

      {/* User name */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-800">Identification</h3>
        </div>

        <div className="bg-violet-50 rounded-lg p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
          <p className="text-xs text-violet-700">
            Votre nom apparait dans les notifications quand vous ajoutez ou modifiez du stock.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre nom
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ex: Fadia, Ahmed..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      {/* Exchange rate */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-800">Taux de change</h3>
        </div>

        <div className="bg-violet-50 rounded-lg p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
          <p className="text-xs text-violet-700">
            Definissez le taux de conversion EUR vers DZD (Dinar Algerien).
            Ce taux sera utilise pour tous les calculs de prix en DZD.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            1 EUR =
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) =>
                setExchangeRate(Math.max(0, parseFloat(e.target.value) || 0))
              }
              step={0.01}
              min={0}
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
            />
            <span className="text-gray-600 font-medium">DZD</span>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-gray-500 font-medium">Apercu conversion</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">10 EUR =</span>{' '}
              <span className="font-medium text-gray-700">
                {formatDZD(10 * exchangeRate)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">50 EUR =</span>{' '}
              <span className="font-medium text-gray-700">
                {formatDZD(50 * exchangeRate)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">100 EUR =</span>{' '}
              <span className="font-medium text-gray-700">
                {formatDZD(100 * exchangeRate)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">500 EUR =</span>{' '}
              <span className="font-medium text-gray-700">
                {formatDZD(500 * exchangeRate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock threshold */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h3 className="font-semibold text-gray-800">Alerte stock faible</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seuil d'alerte (quantite)
          </label>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) =>
              setLowStockThreshold(Math.max(1, parseInt(e.target.value) || 1))
            }
            min={1}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
          />
          <p className="text-xs text-gray-400 mt-1">
            Les produits avec une quantite egale ou inferieure seront signales
            en alerte
          </p>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md ${
          saved
            ? 'bg-green-600 text-white'
            : 'bg-violet-600 text-white hover:bg-violet-700'
        }`}
      >
        <Save className="w-5 h-5" />
        {saved ? 'Enregistre !' : 'Enregistrer les reglages'}
      </button>
    </div>
  );
}
