import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './hooks/useStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import SettingsPage from './components/SettingsPage';
import type { Product } from './types';

export default function App() {
  const { products, settings, addProduct, updateProduct, deleteProduct, updateSettings } =
    useStore();
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean).sort();
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean).sort();

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
