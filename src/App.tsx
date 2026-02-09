import { useState, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useStore, getStoredUsername, setStoredUsername } from './hooks/useStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import SettingsPage from './components/SettingsPage';
import UserNameModal from './components/UserNameModal';
import SaleModal from './components/SaleModal';
import type { Product } from './types';
import { PackageSearch } from 'lucide-react';

export default function App() {
  const {
    products,
    settings,
    notifications,
    sales,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    cancelSale,
    registerUser,
    isUsernameTaken,
    updateSettings,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useStore();
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saleProduct, setSaleProduct] = useState<Product | null>(null);
  const [showNameModal, setShowNameModal] = useState(!getStoredUsername());
  const handleClearEdit = useCallback(() => setEditProduct(null), []);

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
    <>
      {showNameModal && (
        <UserNameModal
          onSave={(name) => {
            registerUser(name);
            setStoredUsername(name);
            setShowNameModal(false);
          }}
        />
      )}
      {saleProduct && (
        <SaleModal
          product={saleProduct}
          settings={settings}
          onConfirm={(productId, quantity, actualPrice) => {
            recordSale(productId, quantity, actualPrice);
            setSaleProduct(null);
          }}
          onClose={() => setSaleProduct(null)}
        />
      )}
      <HashRouter>
        <Routes>
          <Route
            element={
              <Layout
                notifications={notifications}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                onClearAll={clearAllNotifications}
              />
            }
          >
            <Route
              index
              element={<Dashboard products={products} sales={sales} settings={settings} onCancelSale={cancelSale} />}
            />
            <Route
              path="products"
              element={
                <ProductTable
                  products={products}
                  settings={settings}
                  onDelete={deleteProduct}
                  onEdit={(product) => setEditProduct(product)}
                  onSell={(product) => setSaleProduct(product)}
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
                  onClearEdit={handleClearEdit}
                  existingBrands={brands}
                  existingCategories={categories}
                />
              }
            />
            <Route
              path="settings"
              element={
                <SettingsPage settings={settings} onSave={updateSettings} isUsernameTaken={isUsernameTaken} registerUser={registerUser} />
              }
            />
          </Route>
        </Routes>
      </HashRouter>
    </>
  );
}
