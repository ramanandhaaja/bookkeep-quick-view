
// Local storage utility functions

export interface Sale {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  items: SaleItem[];
  notes?: string;
}

export interface SaleItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  date: string;
  amount: number;
  status: "Received" | "Pending" | "Cancelled";
  items: PurchaseItem[];
  notes?: string;
}

export interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  items: SaleItem[];
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  deliveryDate: string;
  amount: number;
  status: "Fulfilled" | "Pending" | "Cancelled";
  items: PurchaseItem[];
  notes?: string;
}

// Storage keys
const STORAGE_KEYS = {
  SALES: 'accounting_sales',
  PURCHASES: 'accounting_purchases',
  INVOICES: 'accounting_invoices',
  PURCHASE_ORDERS: 'accounting_purchase_orders',
};

// Generic get function
function getItems<T>(key: string): T[] {
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
}

// Generic save function
function saveItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// Sales
export function getSales(): Sale[] {
  return getItems<Sale>(STORAGE_KEYS.SALES);
}

export function saveSale(sale: Sale): void {
  const sales = getSales();
  sales.push(sale);
  saveItems(STORAGE_KEYS.SALES, sales);
}

export function updateSale(updatedSale: Sale): void {
  const sales = getSales();
  const index = sales.findIndex(sale => sale.id === updatedSale.id);
  if (index !== -1) {
    sales[index] = updatedSale;
    saveItems(STORAGE_KEYS.SALES, sales);
  }
}

export function deleteSale(id: string): void {
  const sales = getSales();
  const filteredSales = sales.filter(sale => sale.id !== id);
  saveItems(STORAGE_KEYS.SALES, filteredSales);
}

// Purchases
export function getPurchases(): Purchase[] {
  return getItems<Purchase>(STORAGE_KEYS.PURCHASES);
}

export function savePurchase(purchase: Purchase): void {
  const purchases = getPurchases();
  purchases.push(purchase);
  saveItems(STORAGE_KEYS.PURCHASES, purchases);
}

export function updatePurchase(updatedPurchase: Purchase): void {
  const purchases = getPurchases();
  const index = purchases.findIndex(purchase => purchase.id === updatedPurchase.id);
  if (index !== -1) {
    purchases[index] = updatedPurchase;
    saveItems(STORAGE_KEYS.PURCHASES, purchases);
  }
}

export function deletePurchase(id: string): void {
  const purchases = getPurchases();
  const filteredPurchases = purchases.filter(purchase => purchase.id !== id);
  saveItems(STORAGE_KEYS.PURCHASES, filteredPurchases);
}

// Invoices
export function getInvoices(): Invoice[] {
  return getItems<Invoice>(STORAGE_KEYS.INVOICES);
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  invoices.push(invoice);
  saveItems(STORAGE_KEYS.INVOICES, invoices);
}

export function updateInvoice(updatedInvoice: Invoice): void {
  const invoices = getInvoices();
  const index = invoices.findIndex(invoice => invoice.id === updatedInvoice.id);
  if (index !== -1) {
    invoices[index] = updatedInvoice;
    saveItems(STORAGE_KEYS.INVOICES, invoices);
  }
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices();
  const filteredInvoices = invoices.filter(invoice => invoice.id !== id);
  saveItems(STORAGE_KEYS.INVOICES, filteredInvoices);
}

// Purchase Orders
export function getPurchaseOrders(): PurchaseOrder[] {
  return getItems<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS);
}

export function savePurchaseOrder(purchaseOrder: PurchaseOrder): void {
  const purchaseOrders = getPurchaseOrders();
  purchaseOrders.push(purchaseOrder);
  saveItems(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
}

export function updatePurchaseOrder(updatedPurchaseOrder: PurchaseOrder): void {
  const purchaseOrders = getPurchaseOrders();
  const index = purchaseOrders.findIndex(po => po.id === updatedPurchaseOrder.id);
  if (index !== -1) {
    purchaseOrders[index] = updatedPurchaseOrder;
    saveItems(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
  }
}

export function deletePurchaseOrder(id: string): void {
  const purchaseOrders = getPurchaseOrders();
  const filteredPurchaseOrders = purchaseOrders.filter(po => po.id !== id);
  saveItems(STORAGE_KEYS.PURCHASE_ORDERS, filteredPurchaseOrders);
}

// Helper to generate new IDs
export function generateId(prefix: string): string {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${random}`;
}
