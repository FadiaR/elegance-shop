import { useState, useCallback, useEffect } from 'react';
import type { Product, AppSettings } from '../types';
import { db } from '../firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_SETTINGS: AppSettings = {
  exchangeRate: 237.5,
  lowStockThreshold: 3,
};

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Real-time sync: listen to products
  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Product[] = Object.values(data);
        setProducts(list);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time sync: listen to settings
  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSettingsState({ ...DEFAULT_SETTINGS, ...data });
      }
    });
    return () => unsubscribe();
  }, []);

  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const id = uuidv4();
      const product: Product = { ...data, id, createdAt: now, updatedAt: now };
      set(ref(db, `products/${id}`), product);
    },
    [],
  );

  const updateProduct = useCallback((updated: Product) => {
    const product = { ...updated, updatedAt: new Date().toISOString() };
    set(ref(db, `products/${updated.id}`), product);
  }, []);

  const deleteProduct = useCallback((id: string) => {
    remove(ref(db, `products/${id}`));
  }, []);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    set(ref(db, 'settings'), newSettings);
  }, []);

  return {
    products,
    settings,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
  };
}
