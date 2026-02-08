export interface Product {
  id: string;
  name: string;
  description: string;
  photo: string; // base64 data URL
  brand: string;
  category: string;
  quantity: number;
  purchasePrice: number; // EUR
  sellingPrice: number; // EUR
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  exchangeRate: number; // 1 EUR = X DZD
  lowStockThreshold: number;
}

export type SortField = 'name' | 'brand' | 'category' | 'quantity' | 'purchasePrice' | 'sellingPrice' | 'profit';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
