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
  addedBy?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockNotification {
  id: string;
  type: 'stock_added' | 'stock_updated' | 'stock_deleted';
  productName: string;
  productId: string;
  previousQuantity?: number;
  newQuantity?: number;
  userName: string;
  message: string;
  createdAt: string;
  read: boolean;
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
