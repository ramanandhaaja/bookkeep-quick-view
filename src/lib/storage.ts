// Local storage utility functions

export interface Sale {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  items: SaleItem[];
  notes?: string;
  tax?: {
    percentage: number;
    amount: number;
  };
  category?: string;
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
  category?: string;
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
  tax?: {
    percentage: number;
    amount: number;
  };
  notes?: string;
  category?: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  deliveryDate: string;
  amount: number;
  status: "Fulfilled" | "Pending" | "Cancelled";
  items: PurchaseItem[];
  tax?: {
    percentage: number;
    amount: number;
  };
  notes?: string;
  category?: string;
}

// Format currency as Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Storage keys
const STORAGE_KEYS = {
  SALES: 'accounting_sales',
  PURCHASES: 'accounting_purchases',
  INVOICES: 'accounting_invoices',
  PURCHASE_ORDERS: 'accounting_purchase_orders',
  CATEGORIES: 'accounting_categories',
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

// Categories
export function getCategories(): string[] {
  return getItems<string>(STORAGE_KEYS.CATEGORIES);
}

export function saveCategory(category: string): void {
  const categories = getCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    saveItems(STORAGE_KEYS.CATEGORIES, categories);
  }
}

export function getAllCategoriesFromTransactions(): string[] {
  const sales = getSales();
  const purchases = getPurchases();
  const invoices = getInvoices();
  const purchaseOrders = getPurchaseOrders();
  
  const allCategories = new Set<string>();
  
  sales.forEach(sale => sale.category && allCategories.add(sale.category));
  purchases.forEach(purchase => purchase.category && allCategories.add(purchase.category));
  invoices.forEach(invoice => invoice.category && allCategories.add(invoice.category));
  purchaseOrders.forEach(po => po.category && allCategories.add(po.category));
  
  // Also include saved categories
  getCategories().forEach(category => allCategories.add(category));
  
  return Array.from(allCategories).sort();
}

// Sales
export function getSales(): Sale[] {
  return getItems<Sale>(STORAGE_KEYS.SALES);
}

export function getSaleById(id: string): Sale | undefined {
  const sales = getSales();
  return sales.find(sale => sale.id === id);
}

// Modified saveSale to also save category
export function saveSale(sale: Sale): void {
  const sales = getSales();
  sales.push(sale);
  saveItems(STORAGE_KEYS.SALES, sales);
  
  // Save category if it exists
  if (sale.category) {
    saveCategory(sale.category);
  }
}

// Modified updateSale to also save category
export function updateSale(updatedSale: Sale): void {
  const sales = getSales();
  const index = sales.findIndex(sale => sale.id === updatedSale.id);
  if (index !== -1) {
    sales[index] = updatedSale;
    saveItems(STORAGE_KEYS.SALES, sales);
    
    // Save category if it exists
    if (updatedSale.category) {
      saveCategory(updatedSale.category);
    }
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

export function getPurchaseById(id: string): Purchase | undefined {
  const purchases = getPurchases();
  return purchases.find(purchase => purchase.id === id);
}

// Modified savePurchase to also save category
export function savePurchase(purchase: Purchase): void {
  const purchases = getPurchases();
  purchases.push(purchase);
  saveItems(STORAGE_KEYS.PURCHASES, purchases);
  
  // Save category if it exists
  if (purchase.category) {
    saveCategory(purchase.category);
  }
}

// Modified updatePurchase to also save category
export function updatePurchase(updatedPurchase: Purchase): void {
  const purchases = getPurchases();
  const index = purchases.findIndex(purchase => purchase.id === updatedPurchase.id);
  if (index !== -1) {
    purchases[index] = updatedPurchase;
    saveItems(STORAGE_KEYS.PURCHASES, purchases);
    
    // Save category if it exists
    if (updatedPurchase.category) {
      saveCategory(updatedPurchase.category);
    }
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
  
  // Save category if it exists
  if (invoice.category) {
    saveCategory(invoice.category);
  }
}

export function updateInvoice(updatedInvoice: Invoice): void {
  const invoices = getInvoices();
  const index = invoices.findIndex(invoice => invoice.id === updatedInvoice.id);
  if (index !== -1) {
    invoices[index] = updatedInvoice;
    saveItems(STORAGE_KEYS.INVOICES, invoices);
    
    // Save category if it exists
    if (updatedInvoice.category) {
      saveCategory(updatedInvoice.category);
    }
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
  
  // Save category if it exists
  if (purchaseOrder.category) {
    saveCategory(purchaseOrder.category);
  }
}

export function updatePurchaseOrder(updatedPurchaseOrder: PurchaseOrder): void {
  const purchaseOrders = getPurchaseOrders();
  const index = purchaseOrders.findIndex(po => po.id === updatedPurchaseOrder.id);
  if (index !== -1) {
    purchaseOrders[index] = updatedPurchaseOrder;
    saveItems(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
    
    // Save category if it exists
    if (updatedPurchaseOrder.category) {
      saveCategory(updatedPurchaseOrder.category);
    }
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
