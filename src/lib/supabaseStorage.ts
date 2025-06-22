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

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  unit_price: number;
  is_active: boolean;
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

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
};

export const saveCategory = async (category: Omit<Category, 'created_at' | 'updated_at'>): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .insert([category]);

  if (error) {
    console.error('Error saving category:', error);
    throw error;
  }
};

export const updateCategory = async (category: Category): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .update({
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', category.id);

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getItems = async (): Promise<Item[]> => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching items:', error);
    throw error;
  }

  return data || [];
};

export const saveItem = async (item: Omit<Item, 'created_at' | 'updated_at'>): Promise<void> => {
  const { error } = await supabase
    .from('items')
    .insert([item]);

  if (error) {
    console.error('Error saving item:', error);
    throw error;
  }
};

export const updateItem = async (item: Item): Promise<void> => {
  const { error } = await supabase
    .from('items')
    .update({
      name: item.name,
      description: item.description,
      category_id: item.category_id,
      unit_price: item.unit_price,
      is_active: item.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', item.id);

  if (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('items')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const getAllCategoriesFromTransactions = async (): Promise<string[]> => {
  try {
    const { data: categoriesData, error } = await supabase
      .from('categories')
      .select('name')
      .eq('is_active', true);

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return categoriesData?.map(cat => cat.name) || [];
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
};
