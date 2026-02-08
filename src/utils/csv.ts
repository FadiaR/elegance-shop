import type { Product } from '../types';

export function exportProductsToCSV(products: Product[], exchangeRate: number): void {
  const headers = [
    'Nom',
    'Description',
    'Marque',
    'Categorie',
    'Quantite',
    'Prix Achat (EUR)',
    'Prix Vente (EUR)',
    'Prix Achat (DZD)',
    'Prix Vente (DZD)',
    'Benefice (EUR)',
    'Benefice (DZD)',
    'Benefice Total (EUR)',
    'Benefice Total (DZD)',
  ];

  const rows = products.map((p) => {
    const profitEur = p.sellingPrice - p.purchasePrice;
    const profitDzd = profitEur * exchangeRate;
    return [
      `"${p.name}"`,
      `"${p.description}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      p.quantity,
      p.purchasePrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      (p.purchasePrice * exchangeRate).toFixed(2),
      (p.sellingPrice * exchangeRate).toFixed(2),
      profitEur.toFixed(2),
      profitDzd.toFixed(2),
      (profitEur * p.quantity).toFixed(2),
      (profitDzd * p.quantity).toFixed(2),
    ].join(';');
  });

  const totalPurchaseEur = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
  const totalSellingEur = products.reduce((s, p) => s + p.sellingPrice * p.quantity, 0);
  const totalProfitEur = totalSellingEur - totalPurchaseEur;

  rows.push('');
  rows.push(
    [
      '"TOTAUX"',
      '',
      '',
      '',
      products.reduce((s, p) => s + p.quantity, 0),
      totalPurchaseEur.toFixed(2),
      totalSellingEur.toFixed(2),
      (totalPurchaseEur * exchangeRate).toFixed(2),
      (totalSellingEur * exchangeRate).toFixed(2),
      totalProfitEur.toFixed(2),
      (totalProfitEur * exchangeRate).toFixed(2),
      '',
      '',
    ].join(';'),
  );

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `elegance-shop-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
