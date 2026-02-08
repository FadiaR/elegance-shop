import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './hooks/useStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import SettingsPage from './components/SettingsPage';
import type { Product } from './types';
import { PackageSearch } from 'lucide-react';

export default function App() {
  const { products, settings, loading, addProduct, updateProduct, deleteProduct, updateSettings } =
    useStore();
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean).sort();
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <PackageSearch className="w-12 h-12 text-violet-600 animate-pulse" />
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={<Dashboard products={products} settings={settings} />}
          />
          <Route
            path="products"
            element={
              <ProductTable
                products={products}
                settings={settings}
                onDelete={deleteProduct}
                onEdit={(product) => setEditProduct(product)}
              />
            }
          />
          <Route
            path="add"
            element={
              <ProductForm
                onSave={addProduct}
                onUpdate={updateProduct}
                editProduct={editProduct}
                existingBrands={brands}
                existingCategories={categories}
              />
            }
          />
          <Route
            path="settings"
            element={
              <SettingsPage settings={settings} onSave={updateSettings} />
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}
