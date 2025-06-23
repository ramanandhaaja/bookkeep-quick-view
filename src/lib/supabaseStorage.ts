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
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });

  if (salesError) {
    console.error('Error fetching sales:', salesError);
    throw salesError;
  }

  // Fetch items for each sale
  const salesWithItems = await Promise.all(
    (salesData || []).map(async (sale) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id);

      if (itemsError) {
        console.error('Error fetching sale items:', itemsError);
        throw itemsError;
      }

      return {
        ...sale,
        items: (itemsData || []).map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price
        })),
        tax: sale.tax_percentage > 0 ? {
          percentage: sale.tax_percentage,
          amount: sale.tax_amount
        } : undefined
      };
    })
  );

  return salesWithItems;
};

export const saveSale = async (sale: Sale): Promise<void> => {
  // Save the main sale record
  const { error: saleError } = await supabase
    .from('sales')
    .insert([{
      id: sale.id,
      customer: sale.customer,
      date: sale.date,
      amount: sale.amount,
      status: sale.status,
      notes: sale.notes,
      tax_percentage: sale.tax?.percentage || 0,
      tax_amount: sale.tax?.amount || 0,
      category: sale.category,
    }]);

  if (saleError) {
    console.error('Error saving sale:', saleError);
    throw saleError;
  }

  // Save the sale items
  const itemsToInsert = sale.items.map(item => ({
    id: item.id,
    sale_id: sale.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error saving sale items:', itemsError);
    throw itemsError;
  }
};

export const updateSale = async (sale: Sale): Promise<void> => {
  // Update the main sale record
  const { error: saleError } = await supabase
    .from('sales')
    .update({
      customer: sale.customer,
      date: sale.date,
      amount: sale.amount,
      status: sale.status,
      notes: sale.notes,
      tax_percentage: sale.tax?.percentage || 0,
      tax_amount: sale.tax?.amount || 0,
      category: sale.category,
    })
    .eq('id', sale.id);

  if (saleError) {
    console.error('Error updating sale:', saleError);
    throw saleError;
  }

  // Delete existing items and insert new ones
  const { error: deleteError } = await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', sale.id);

  if (deleteError) {
    console.error('Error deleting sale items:', deleteError);
    throw deleteError;
  }

  // Insert updated items
  const itemsToInsert = sale.items.map(item => ({
    id: item.id,
    sale_id: sale.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error saving sale items:', itemsError);
    throw itemsError;
  }
};

export const deleteSale = async (id: string): Promise<void> => {
  // Delete sale items first
  const { error: itemsError } = await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', id);

  if (itemsError) {
    console.error('Error deleting sale items:', itemsError);
    throw itemsError;
  }

  // Delete the main sale record
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
  const { data: purchasesData, error: purchasesError } = await supabase
    .from('purchases')
    .select('*')
    .order('date', { ascending: false });

  if (purchasesError) {
    console.error('Error fetching purchases:', purchasesError);
    throw purchasesError;
  }

  // Fetch items for each purchase
  const purchasesWithItems = await Promise.all(
    (purchasesData || []).map(async (purchase) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_items')
        .select('*')
        .eq('purchase_id', purchase.id);

      if (itemsError) {
        console.error('Error fetching purchase items:', itemsError);
        throw itemsError;
      }

      return {
        ...purchase,
        items: (itemsData || []).map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price
        })),
        journalEntryId: purchase.journal_entry_id
      };
    })
  );

  return purchasesWithItems;
};

export const savePurchase = async (purchase: Purchase): Promise<void> => {
  // Save the main purchase record
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert([{
      id: purchase.id,
      supplier: purchase.supplier,
      date: purchase.date,
      amount: purchase.amount,
      status: purchase.status,
      notes: purchase.notes,
      category: purchase.category,
      journal_entry_id: purchase.journalEntryId,
    }]);

  if (purchaseError) {
    console.error('Error saving purchase:', purchaseError);
    throw purchaseError;
  }

  // Save the purchase items
  const itemsToInsert = purchase.items.map(item => ({
    id: item.id,
    purchase_id: purchase.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice
  }));

  const { error: itemsError } = await supabase
    .from('purchase_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error saving purchase items:', itemsError);
    throw itemsError;
  }
};

export const updatePurchase = async (purchase: Purchase): Promise<void> => {
  // Update the main purchase record
  const { error: purchaseError } = await supabase
    .from('purchases')
    .update({
      supplier: purchase.supplier,
      date: purchase.date,
      amount: purchase.amount,
      status: purchase.status,
      notes: purchase.notes,
      category: purchase.category,
      journal_entry_id: purchase.journalEntryId,
    })
    .eq('id', purchase.id);

  if (purchaseError) {
    console.error('Error updating purchase:', purchaseError);
    throw purchaseError;
  }

  // Delete existing items and insert new ones
  const { error: deleteError } = await supabase
    .from('purchase_items')
    .delete()
    .eq('purchase_id', purchase.id);

  if (deleteError) {
    console.error('Error deleting purchase items:', deleteError);
    throw deleteError;
  }

  // Insert updated items
  const itemsToInsert = purchase.items.map(item => ({
    id: item.id,
    purchase_id: purchase.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice
  }));

  const { error: itemsError } = await supabase
    .from('purchase_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error saving purchase items:', itemsError);
    throw itemsError;
  }
};

export const deletePurchase = async (id: string): Promise<void> => {
  // Delete purchase items first
  const { error: itemsError } = await supabase
    .from('purchase_items')
    .delete()
    .eq('purchase_id', id);

  if (itemsError) {
    console.error('Error deleting purchase items:', itemsError);
    throw itemsError;
  }

  // Delete the main purchase record
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
  const { data: entriesData, error: entriesError } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false });

  if (entriesError) {
    console.error('Error fetching journal entries:', entriesError);
    throw entriesError;
  }

  // Fetch line items for each journal entry
  const entriesWithLineItems = await Promise.all(
    (entriesData || []).map(async (entry) => {
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('journal_line_items')
        .select('*')
        .eq('journal_entry_id', entry.id);

      if (lineItemsError) {
        console.error('Error fetching journal line items:', lineItemsError);
        throw lineItemsError;
      }

      return {
        ...entry,
        lineItems: (lineItemsData || []).map(item => ({
          id: item.id,
          account: item.account,
          description: item.description,
          debit: item.debit,
          credit: item.credit
        }))
      };
    })
  );

  return entriesWithLineItems;
};

export const saveJournalEntry = async (entry: JournalEntry): Promise<void> => {
  // Save the main journal entry record without lineItems
  const { error: entryError } = await supabase
    .from('journal_entries')
    .insert([{
      id: entry.id,
      date: entry.date,
      reference: entry.reference,
      description: entry.description,
      category: entry.category,
      totalDebit: entry.totalDebit,
      totalCredit: entry.totalCredit,
      notes: entry.notes,
    }]);

  if (entryError) {
    console.error('Error saving journal entry:', entryError);
    throw entryError;
  }

  // Save the journal line items separately
  if (entry.lineItems && entry.lineItems.length > 0) {
    const lineItemsToInsert = entry.lineItems.map(item => ({
      id: item.id,
      journal_entry_id: entry.id,
      account: item.account,
      description: item.description,
      debit: item.debit,
      credit: item.credit
    }));

    const { error: lineItemsError } = await supabase
      .from('journal_line_items')
      .insert(lineItemsToInsert);

    if (lineItemsError) {
      console.error('Error saving journal line items:', lineItemsError);
      throw lineItemsError;
    }
  }
};

export const updateJournalEntry = async (entry: JournalEntry): Promise<void> => {
  // Update the main journal entry record
  const { error: entryError } = await supabase
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

  if (entryError) {
    console.error('Error updating journal entry:', entryError);
    throw entryError;
  }

  // Delete existing line items and insert new ones
  const { error: deleteError } = await supabase
    .from('journal_line_items')
    .delete()
    .eq('journal_entry_id', entry.id);

  if (deleteError) {
    console.error('Error deleting journal line items:', deleteError);
    throw deleteError;
  }

  // Insert updated line items
  if (entry.lineItems && entry.lineItems.length > 0) {
    const lineItemsToInsert = entry.lineItems.map(item => ({
      id: item.id,
      journal_entry_id: entry.id,
      account: item.account,
      description: item.description,
      debit: item.debit,
      credit: item.credit
    }));

    const { error: lineItemsError } = await supabase
      .from('journal_line_items')
      .insert(lineItemsToInsert);

    if (lineItemsError) {
      console.error('Error saving journal line items:', lineItemsError);
      throw lineItemsError;
    }
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

export const getAccountNames = async (): Promise<string[]> => {
  try {
    const { data: accountsData, error } = await supabase
      .from('chart_of_accounts')
      .select('account_name')
      .eq('is_active', true)
      .order('account_name');

    if (error) {
      console.error("Error fetching account names:", error);
      throw error;
    }

    return accountsData?.map(acc => acc.account_name) || [];
  } catch (error) {
    console.error("Error fetching account names:", error);
    return [];
  }
};

export const saveAccount = async (accountName: string): Promise<void> => {
  const newAccount = {
    id: generateId("ACC"),
    account_code: `${Date.now()}`, // Simple code generation
    account_name: accountName,
    account_type: "Asset", // Default type
    normal_balance: "Debit", // Default balance
    is_active: true
  };

  const { error } = await supabase
    .from('chart_of_accounts')
    .insert([newAccount]);

  if (error) {
    console.error('Error saving account:', error);
    throw error;
  }
};
