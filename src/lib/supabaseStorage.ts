
import { supabase } from "@/integrations/supabase/client";

// Supabase-based storage for accounting system
export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string;
  category?: string;
  notes?: string;
  totalDebit: number;
  totalCredit: number;
  lineItems: JournalLineItem[];
  sourceType?: string;
  sourceId?: string;
}

export interface JournalLineItem {
  id: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
}

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
  journalEntryId?: string;
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
  journalEntryId?: string;
}

export interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

// Journal Entry Operations
export const saveJournalEntry = async (entry: JournalEntry): Promise<void> => {
  // Save journal entry
  const { error: journalError } = await supabase
    .from('journal_entries')
    .insert({
      id: entry.id,
      date: entry.date,
      description: entry.description,
      reference: entry.reference,
      category: entry.category,
      notes: entry.notes,
      total_debit: entry.totalDebit,
      total_credit: entry.totalCredit,
      source_type: entry.sourceType,
      source_id: entry.sourceId,
    });

  if (journalError) throw journalError;

  // Save line items
  const lineItemsData = entry.lineItems.map(item => ({
    id: item.id,
    journal_entry_id: entry.id,
    account: item.account,
    description: item.description,
    debit: item.debit,
    credit: item.credit,
  }));

  const { error: lineItemsError } = await supabase
    .from('journal_line_items')
    .insert(lineItemsData);

  if (lineItemsError) throw lineItemsError;
};

export const updateJournalEntry = async (entry: JournalEntry): Promise<void> => {
  // Update journal entry
  const { error: journalError } = await supabase
    .from('journal_entries')
    .update({
      date: entry.date,
      description: entry.description,
      reference: entry.reference,
      category: entry.category,
      notes: entry.notes,
      total_debit: entry.totalDebit,
      total_credit: entry.totalCredit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entry.id);

  if (journalError) throw journalError;

  // Delete existing line items
  const { error: deleteError } = await supabase
    .from('journal_line_items')
    .delete()
    .eq('journal_entry_id', entry.id);

  if (deleteError) throw deleteError;

  // Insert updated line items
  const lineItemsData = entry.lineItems.map(item => ({
    id: item.id,
    journal_entry_id: entry.id,
    account: item.account,
    description: item.description,
    debit: item.debit,
    credit: item.credit,
  }));

  const { error: lineItemsError } = await supabase
    .from('journal_line_items')
    .insert(lineItemsData);

  if (lineItemsError) throw lineItemsError;
};

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const { data: entries, error: entriesError } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false });

  if (entriesError) throw entriesError;

  const { data: lineItems, error: lineItemsError } = await supabase
    .from('journal_line_items')
    .select('*');

  if (lineItemsError) throw lineItemsError;

  return entries.map(entry => ({
    id: entry.id,
    date: entry.date,
    description: entry.description,
    reference: entry.reference,
    category: entry.category,
    notes: entry.notes,
    totalDebit: entry.total_debit,
    totalCredit: entry.total_credit,
    sourceType: entry.source_type,
    sourceId: entry.source_id,
    lineItems: lineItems
      .filter(item => item.journal_entry_id === entry.id)
      .map(item => ({
        id: item.id,
        account: item.account,
        description: item.description,
        debit: item.debit,
        credit: item.credit,
      })),
  }));
};

export const deleteJournalEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Create journal entry for sale
const createSaleJournalEntry = async (sale: Sale): Promise<string> => {
  const journalEntry: JournalEntry = {
    id: generateId("JE"),
    date: sale.date,
    description: `Sale to ${sale.customer}`,
    reference: sale.id,
    category: sale.category,
    sourceType: "sale",
    sourceId: sale.id,
    totalDebit: sale.amount,
    totalCredit: sale.amount,
    lineItems: [
      {
        id: generateId("JLI"),
        account: "Accounts Receivable",
        description: `Sale to ${sale.customer}`,
        debit: sale.amount,
        credit: 0,
      },
      {
        id: generateId("JLI"),
        account: "Sales Revenue",
        description: `Sale to ${sale.customer}`,
        debit: 0,
        credit: sale.amount,
      },
    ],
  };

  // Add tax entries if applicable
  if (sale.tax && sale.tax.amount > 0) {
    journalEntry.lineItems[0].debit = sale.amount; // Total including tax
    journalEntry.lineItems[1].credit = sale.amount - sale.tax.amount; // Revenue without tax
    journalEntry.lineItems.push({
      id: generateId("JLI"),
      account: "Sales Tax Payable",
      description: `Sales tax for ${sale.customer}`,
      debit: 0,
      credit: sale.tax.amount,
    });
  }

  await saveJournalEntry(journalEntry);
  return journalEntry.id;
};

// Create journal entry for purchase
const createPurchaseJournalEntry = async (purchase: Purchase): Promise<string> => {
  const journalEntry: JournalEntry = {
    id: generateId("JE"),
    date: purchase.date,
    description: `Purchase from ${purchase.supplier}`,
    reference: purchase.id,
    category: purchase.category,
    sourceType: "purchase",
    sourceId: purchase.id,
    totalDebit: purchase.amount,
    totalCredit: purchase.amount,
    lineItems: [
      {
        id: generateId("JLI"),
        account: "Operating Expenses",
        description: `Purchase from ${purchase.supplier}`,
        debit: purchase.amount,
        credit: 0,
      },
      {
        id: generateId("JLI"),
        account: "Accounts Payable",
        description: `Purchase from ${purchase.supplier}`,
        debit: 0,
        credit: purchase.amount,
      },
    ],
  };

  await saveJournalEntry(journalEntry);
  return journalEntry.id;
};

// Sales Operations
export const saveSale = async (sale: Sale): Promise<void> => {
  // Create journal entry first
  const journalEntryId = await createSaleJournalEntry(sale);

  // Save sale
  const { error: saleError } = await supabase
    .from('sales')
    .insert({
      id: sale.id,
      customer: sale.customer,
      date: sale.date,
      amount: sale.amount,
      status: sale.status,
      category: sale.category,
      notes: sale.notes,
      tax_percentage: sale.tax?.percentage || 0,
      tax_amount: sale.tax?.amount || 0,
      journal_entry_id: journalEntryId,
    });

  if (saleError) throw saleError;

  // Save sale items
  const saleItemsData = sale.items.map(item => ({
    id: item.id,
    sale_id: sale.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItemsData);

  if (itemsError) throw itemsError;
};

export const updateSale = async (sale: Sale): Promise<void> => {
  // Update sale
  const { error: saleError } = await supabase
    .from('sales')
    .update({
      customer: sale.customer,
      date: sale.date,
      amount: sale.amount,
      status: sale.status,
      category: sale.category,
      notes: sale.notes,
      tax_percentage: sale.tax?.percentage || 0,
      tax_amount: sale.tax?.amount || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sale.id);

  if (saleError) throw saleError;

  // Delete existing items
  const { error: deleteError } = await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', sale.id);

  if (deleteError) throw deleteError;

  // Insert updated items
  const saleItemsData = sale.items.map(item => ({
    id: item.id,
    sale_id: sale.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItemsData);

  if (itemsError) throw itemsError;
};

export const getSales = async (): Promise<Sale[]> => {
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });

  if (salesError) throw salesError;

  const { data: items, error: itemsError } = await supabase
    .from('sale_items')
    .select('*');

  if (itemsError) throw itemsError;

  return sales.map(sale => ({
    id: sale.id,
    customer: sale.customer,
    date: sale.date,
    amount: sale.amount,
    status: sale.status as Sale["status"],
    category: sale.category,
    notes: sale.notes,
    tax: sale.tax_percentage > 0 ? {
      percentage: sale.tax_percentage,
      amount: sale.tax_amount,
    } : undefined,
    journalEntryId: sale.journal_entry_id,
    items: items
      .filter(item => item.sale_id === sale.id)
      .map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
  }));
};

export const deleteSale = async (id: string): Promise<void> => {
  // Get sale to find journal entry ID
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select('journal_entry_id')
    .eq('id', id)
    .single();

  if (saleError) throw saleError;

  // Delete sale (items will be deleted via cascade)
  const { error: deleteError } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (deleteError) throw deleteError;

  // Delete associated journal entry
  if (sale.journal_entry_id) {
    await deleteJournalEntry(sale.journal_entry_id);
  }
};

// Purchase Operations
export const savePurchase = async (purchase: Purchase): Promise<void> => {
  // Create journal entry first
  const journalEntryId = await createPurchaseJournalEntry(purchase);

  // Save purchase
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      id: purchase.id,
      supplier: purchase.supplier,
      date: purchase.date,
      amount: purchase.amount,
      status: purchase.status,
      category: purchase.category,
      notes: purchase.notes,
      journal_entry_id: journalEntryId,
    });

  if (purchaseError) throw purchaseError;

  // Save purchase items
  const purchaseItemsData = purchase.items.map(item => ({
    id: item.id,
    purchase_id: purchase.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  const { error: itemsError } = await supabase
    .from('purchase_items')
    .insert(purchaseItemsData);

  if (itemsError) throw itemsError;
};

export const updatePurchase = async (purchase: Purchase): Promise<void> => {
  // Update purchase
  const { error: purchaseError } = await supabase
    .from('purchases')
    .update({
      supplier: purchase.supplier,
      date: purchase.date,
      amount: purchase.amount,
      status: purchase.status,
      category: purchase.category,
      notes: purchase.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchase.id);

  if (purchaseError) throw purchaseError;

  // Delete existing items
  const { error: deleteError } = await supabase
    .from('purchase_items')
    .delete()
    .eq('purchase_id', purchase.id);

  if (deleteError) throw deleteError;

  // Insert updated items
  const purchaseItemsData = purchase.items.map(item => ({
    id: item.id,
    purchase_id: purchase.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  const { error: itemsError } = await supabase
    .from('purchase_items')
    .insert(purchaseItemsData);

  if (itemsError) throw itemsError;
};

export const getPurchases = async (): Promise<Purchase[]> => {
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('*')
    .order('date', { ascending: false });

  if (purchasesError) throw purchasesError;

  const { data: items, error: itemsError } = await supabase
    .from('purchase_items')
    .select('*');

  if (itemsError) throw itemsError;

  return purchases.map(purchase => ({
    id: purchase.id,
    supplier: purchase.supplier,
    date: purchase.date,
    amount: purchase.amount,
    status: purchase.status as Purchase["status"],
    category: purchase.category,
    notes: purchase.notes,
    journalEntryId: purchase.journal_entry_id,
    items: items
      .filter(item => item.purchase_id === purchase.id)
      .map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
  }));
};

export const deletePurchase = async (id: string): Promise<void> => {
  // Get purchase to find journal entry ID
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('journal_entry_id')
    .eq('id', id)
    .single();

  if (purchaseError) throw purchaseError;

  // Delete purchase (items will be deleted via cascade)
  const { error: deleteError } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id);

  if (deleteError) throw deleteError;

  // Delete associated journal entry
  if (purchase.journal_entry_id) {
    await deleteJournalEntry(purchase.journal_entry_id);
  }
};

// Utility functions
export const generateId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}${random}`.toUpperCase();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getAllCategoriesFromTransactions = (): string[] => {
  // This will be implemented with real data later
  return ["Office Supplies", "Equipment", "Software", "Marketing", "Travel"];
};
