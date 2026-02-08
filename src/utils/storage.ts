import type { Product, AppSettings } from '../types';

const PRODUCTS_KEY = 'elegance_shop_products';
const SETTINGS_KEY = 'elegance_shop_settings';

const DEFAULT_SETTINGS: AppSettings = {
  exchangeRate: 237.5, // approximate EUR to DZD
  lowStockThreshold: 3,
};

export function getProducts(): Product[] {
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Product): void {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function updateProduct(updated: Product): void {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === updated.id);
  if (index !== -1) {
    products[index] = { ...updated, updatedAt: new Date().toISOString() };
    saveProducts(products);
  }
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
}

export function getSettings(): AppSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
