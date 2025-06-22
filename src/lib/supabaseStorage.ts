
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://owppnnfcmalpomkerqku.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cHBubmZjbWFscG9ta2VycWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzE1ODQsImV4cCI6MjA2NTE0NzU4NH0.IQDK_hgr0s_3RA4-8mRpx6rMweSlK9bCtmD_2KXEpTQ";
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Sale {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
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
  status: 'Received' | 'Pending' | 'Cancelled';
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

export interface JournalEntry {
  id: string;
  date: string;
  reference?: string;
  description: string;
  category?: string;
  totalDebit: number;
  totalCredit: number;
  notes?: string;
  lineItems?: JournalLineItem[];
}

export interface JournalLineItem {
  id: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'Customer' | 'Supplier';
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }

  return data || [];
};

export const saveSale = async (sale: Sale): Promise<void> => {
  const { error } = await supabase
    .from('sales')
    .insert([sale]);

  if (error) {
    console.error('Error saving sale:', error);
    throw error;
  }
};

export const updateSale = async (sale: Sale): Promise<void> => {
  const { error } = await supabase
    .from('sales')
    .update({
      customer: sale.customer,
      date: sale.date,
      amount: sale.amount,
      status: sale.status,
      items: sale.items,
      notes: sale.notes,
      tax: sale.tax,
      category: sale.category,
    })
    .eq('id', sale.id);

  if (error) {
    console.error('Error updating sale:', error);
    throw error;
  }
};

export const deleteSale = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
};

export const getPurchases = async (): Promise<Purchase[]> => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }

  return data || [];
};

export const savePurchase = async (purchase: Purchase): Promise<void> => {
  const { error } = await supabase
    .from('purchases')
    .insert([purchase]);

  if (error) {
    console.error('Error saving purchase:', error);
    throw error;
  }
};

export const updatePurchase = async (purchase: Purchase): Promise<void> => {
  const { error } = await supabase
    .from('purchases')
    .update({
      supplier: purchase.supplier,
      date: purchase.date,
      amount: purchase.amount,
      status: purchase.status,
      items: purchase.items,
      notes: purchase.notes,
      category: purchase.category,
      journalEntryId: purchase.journalEntryId,
    })
    .eq('id', purchase.id);

  if (error) {
    console.error('Error updating purchase:', error);
    throw error;
  }
};

export const deletePurchase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting purchase:', error);
    throw error;
  }
};

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }

  return data || [];
};

export const saveJournalEntry = async (entry: JournalEntry): Promise<void> => {
  const { error } = await supabase
    .from('journal_entries')
    .insert([entry]);

  if (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

export const updateJournalEntry = async (entry: JournalEntry): Promise<void> => {
  const { error } = await supabase
    .from('journal_entries')
    .update({
      date: entry.date,
      reference: entry.reference,
      description: entry.description,
      category: entry.category,
      totalDebit: entry.totalDebit,
      totalCredit: entry.totalCredit,
      notes: entry.notes,
    })
    .eq('id', entry.id);

  if (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

export const getContacts = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  return data || [];
};

export const getCustomers = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('type', 'Customer')
    .order('name');

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return data || [];
};

export const getSuppliers = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('type', 'Supplier')
    .order('name');

  if (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }

  return data || [];
};

export const saveContact = async (contact: Omit<Contact, 'created_at' | 'updated_at'>): Promise<void> => {
  const { error } = await supabase
    .from('contacts')
    .insert([contact]);

  if (error) {
    console.error('Error saving contact:', error);
    throw error;
  }
};

export const updateContact = async (contact: Contact): Promise<void> => {
  const { error } = await supabase
    .from('contacts')
    .update({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      type: contact.type,
      balance: contact.balance,
      updated_at: new Date().toISOString()
    })
    .eq('id', contact.id);

  if (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

export const getAllCategoriesFromTransactions = async (): Promise<string[]> => {
  try {
    // Fetch categories from sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('category');

    if (salesError) {
      console.error("Error fetching sales categories:", salesError);
      throw salesError;
    }

    const salesCategories = salesData
      .map(sale => sale.category)
      .filter((category): category is string => Boolean(category)); // Filter out null or undefined

    // Fetch categories from purchases
    const { data: purchasesData, error: purchasesError } = await supabase
      .from('purchases')
      .select('category');

    if (purchasesError) {
      console.error("Error fetching purchases categories:", purchasesError);
      throw purchasesError;
    }

    const purchasesCategories = purchasesData
      .map(purchase => purchase.category)
      .filter((category): category is string => Boolean(category)); // Filter out null or undefined

    // Fetch categories from journal entries
    const { data: journalEntriesData, error: journalEntriesError } = await supabase
      .from('journal_entries')
      .select('category');

    if (journalEntriesError) {
      console.error("Error fetching journal entries categories:", journalEntriesError);
      throw journalEntriesError;
    }

    const journalEntriesCategories = journalEntriesData
      .map(journalEntry => journalEntry.category)
      .filter((category): category is string => Boolean(category)); // Filter out null or undefined

    // Combine and remove duplicates
    const allCategories = [...salesCategories, ...purchasesCategories, ...journalEntriesCategories];
    const uniqueCategories = [...new Set(allCategories)];

    return uniqueCategories;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
};
