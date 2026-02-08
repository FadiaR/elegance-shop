import { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';

interface Props {
  onSave: (name: string) => void;
}

export default function UserNameModal({ onSave }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-violet-700 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Bienvenue !</h2>
          <p className="text-violet-200 text-sm mt-1">
            Entrez votre nom pour le suivi des stocks
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fadia, Ahmed..."
              autoFocus
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ce nom apparaitra dans les notifications de stock
            </p>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuer
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
