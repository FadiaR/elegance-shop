import { useState, useCallback, useEffect } from 'react';
import type { Product, AppSettings } from '../types';
import {
  getProducts,
  saveProducts,
  getSettings,
  saveSettings,
} from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const product: Product = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
      setProducts((prev) => {
        const next = [...prev, product];
        saveProducts(next);
        return next;
      });
    },
    [],
  );

  const updateProduct = useCallback((updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p,
      );
      saveProducts(next);
      return next;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProducts(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  }, []);

  return {
    products,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
  };
}
