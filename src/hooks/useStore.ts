import { useState, useCallback, useEffect } from 'react';
import type { Product, AppSettings, StockNotification } from '../types';
import { db } from '../firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_SETTINGS: AppSettings = {
  exchangeRate: 237.5,
  lowStockThreshold: 3,
};

const USERNAME_KEY = 'elegance-shop-username';

export function getStoredUsername(): string {
  return localStorage.getItem(USERNAME_KEY) || '';
}

export function setStoredUsername(name: string) {
  localStorage.setItem(USERNAME_KEY, name);
}

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<StockNotification[]>([]);
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

  // Real-time sync: listen to notifications
  useEffect(() => {
    const notificationsRef = ref(db, 'notifications');
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: StockNotification[] = Object.values(data);
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(list);
      } else {
        setNotifications([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const addNotification = useCallback((notification: Omit<StockNotification, 'id' | 'createdAt' | 'read'>) => {
    const id = uuidv4();
    const entry: StockNotification = {
      ...notification,
      id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    set(ref(db, `notifications/${id}`), entry);
  }, []);

  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const id = uuidv4();
      const userName = getStoredUsername() || 'Inconnu';
      const product: Product = {
        ...data,
        id,
        addedBy: userName,
        lastModifiedBy: userName,
        createdAt: now,
        updatedAt: now,
      };
      set(ref(db, `products/${id}`), product);
      addNotification({
        type: 'stock_added',
        productName: data.name,
        productId: id,
        newQuantity: data.quantity,
        userName,
        message: `${userName} a ajouté "${data.name}" (qté: ${data.quantity})`,
      });
    },
    [addNotification],
  );

  const updateProduct = useCallback((updated: Product) => {
    const userName = getStoredUsername() || 'Inconnu';
    const product = {
      ...updated,
      lastModifiedBy: userName,
      updatedAt: new Date().toISOString(),
    };
    set(ref(db, `products/${updated.id}`), product);
    addNotification({
      type: 'stock_updated',
      productName: updated.name,
      productId: updated.id,
      previousQuantity: undefined,
      newQuantity: updated.quantity,
      userName,
      message: `${userName} a modifié "${updated.name}" (qté: ${updated.quantity})`,
    });
  }, [addNotification]);

  const deleteProduct = useCallback((id: string) => {
    const userName = getStoredUsername() || 'Inconnu';
    const product = products.find(p => p.id === id);
    const productName = product?.name || 'Produit inconnu';
    remove(ref(db, `products/${id}`));
    addNotification({
      type: 'stock_deleted',
      productName,
      productId: id,
      userName,
      message: `${userName} a supprimé "${productName}"`,
    });
  }, [addNotification, products]);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    set(ref(db, 'settings'), newSettings);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    set(ref(db, `notifications/${id}/read`), true);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    notifications.forEach((n) => {
      if (!n.read) {
        set(ref(db, `notifications/${n.id}/read`), true);
      }
    });
  }, [notifications]);

  const clearAllNotifications = useCallback(() => {
    remove(ref(db, 'notifications'));
  }, []);

  return {
    products,
    settings,
    notifications,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  };
}
