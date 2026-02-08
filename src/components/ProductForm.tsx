import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { Camera, ImagePlus, X, Save, ArrowLeft } from 'lucide-react';

interface Props {
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (product: Product) => void;
  editProduct?: Product | null;
  existingBrands: string[];
  existingCategories: string[];
}

export default function ProductForm({
  onSave,
  onUpdate,
  editProduct,
  existingBrands,
  existingCategories,
}: Props) {
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!editProduct;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setDescription(editProduct.description);
      setPhoto(editProduct.photo);
      setBrand(editProduct.brand);
      setCategory(editProduct.category);
      setQuantity(editProduct.quantity);
      setPurchasePrice(editProduct.purchasePrice);
      setSellingPrice(editProduct.sellingPrice);
    }
  }, [editProduct]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Resize image to avoid localStorage limits
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) {
            h = (h * MAX) / w;
            w = MAX;
          } else {
            w = (w * MAX) / h;
            h = MAX;
          }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        setPhoto(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: name.trim(),
      description: description.trim(),
      photo,
      brand: brand.trim(),
      category: category.trim(),
      quantity,
      purchasePrice,
      sellingPrice,
    };

    if (isEditing && onUpdate && editProduct) {
      onUpdate({
        ...editProduct,
        ...data,
      });
    } else {
      onSave(data);
    }

    // Reset form
    setName('');
    setDescription('');
    setPhoto('');
    setBrand('');
    setCategory('');
    setQuantity(1);
    setPurchasePrice(0);
    setSellingPrice(0);

    navigate('/products');
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />
          {photo ? (
            <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={photo}
                alt="Apercu"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors"
              >
                <Camera className="w-7 h-7" />
                <span className="text-xs">Prendre une photo</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors"
              >
                <ImagePlus className="w-7 h-7" />
                <span className="text-xs">Choisir depuis mes photos</span>
              </button>
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du produit *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
            placeholder="Ex: Sac a main Chanel"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none text-gray-800"
            placeholder="Details, couleur, taille..."
          />
        </div>

        {/* Brand & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              list="brands-list"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
              placeholder="Ex: Chanel"
            />
            <datalist id="brands-list">
              {existingBrands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categorie
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="categories-list"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
              placeholder="Ex: Sacs"
            />
            <datalist id="categories-list">
              {existingCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantite *
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix d'achat (EUR) *
            </label>
            <input
              type="number"
              value={purchasePrice || ''}
              onChange={(e) =>
                setPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))
              }
              min={0}
              step={0.01}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix de vente (EUR) *
            </label>
            <input
              type="number"
              value={sellingPrice || ''}
              onChange={(e) =>
                setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))
              }
              min={0}
              step={0.01}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-800"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Profit preview */}
        {purchasePrice > 0 && sellingPrice > 0 && (
          <div
            className={`rounded-lg p-3 text-sm ${
              sellingPrice > purchasePrice
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            Benefice unitaire :{' '}
            <span className="font-bold">
              {(sellingPrice - purchasePrice).toFixed(2)} EUR
            </span>
            {' | Marge : '}
            <span className="font-bold">
              {((((sellingPrice - purchasePrice) / purchasePrice) * 100) || 0).toFixed(1)}%
            </span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors shadow-md"
        >
          <Save className="w-5 h-5" />
          {isEditing ? 'Modifier' : 'Ajouter le produit'}
        </button>
      </form>
    </div>
  );
}
