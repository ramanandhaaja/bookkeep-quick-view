
-- Create journal_entries table first
CREATE TABLE public.journal_entries (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  category TEXT,
  notes TEXT,
  total_debit DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(10,2) NOT NULL DEFAULT 0,
  source_type TEXT,
  source_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_line_items table
CREATE TABLE public.journal_line_items (
  id TEXT PRIMARY KEY,
  journal_entry_id TEXT NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account TEXT NOT NULL,
  description TEXT NOT NULL,
  debit DECIMAL(10,2) NOT NULL DEFAULT 0,
  credit DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chart of accounts table
CREATE TABLE public.chart_of_accounts (
  id TEXT PRIMARY KEY,
  account_code TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('Debit', 'Credit')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE public.sales (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  category TEXT,
  notes TEXT,
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  journal_entry_id TEXT REFERENCES public.journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sale_items table
CREATE TABLE public.sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE public.purchases (
  id TEXT PRIMARY KEY,
  supplier TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Received', 'Pending', 'Cancelled')),
  category TEXT,
  notes TEXT,
  journal_entry_id TEXT REFERENCES public.journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_items table
CREATE TABLE public.purchase_items (
  id TEXT PRIMARY KEY,
  purchase_id TEXT NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables
CREATE POLICY "Allow all operations on journal_entries" ON public.journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on journal_line_items" ON public.journal_line_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on chart_of_accounts" ON public.chart_of_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sale_items" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchases" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_items" ON public.purchase_items FOR ALL USING (true) WITH CHECK (true);

-- Insert default chart of accounts
INSERT INTO public.chart_of_accounts (id, account_code, account_name, account_type, normal_balance) VALUES
('ACC-001', '1000', 'Cash', 'Asset', 'Debit'),
('ACC-002', '1200', 'Accounts Receivable', 'Asset', 'Debit'),
('ACC-003', '1300', 'Inventory', 'Asset', 'Debit'),
('ACC-004', '2000', 'Accounts Payable', 'Liability', 'Credit'),
('ACC-005', '4000', 'Sales Revenue', 'Revenue', 'Credit'),
('ACC-006', '5000', 'Cost of Goods Sold', 'Expense', 'Debit'),
('ACC-007', '2200', 'Sales Tax Payable', 'Liability', 'Credit'),
('ACC-008', '6000', 'Operating Expenses', 'Expense', 'Debit');

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_date ON public.journal_entries(date);
CREATE INDEX idx_journal_entries_source ON public.journal_entries(source_type, source_id);
CREATE INDEX idx_journal_line_items_journal_id ON public.journal_line_items(journal_entry_id);
CREATE INDEX idx_sales_date ON public.sales(date);
CREATE INDEX idx_sales_journal_entry ON public.sales(journal_entry_id);
CREATE INDEX idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX idx_purchases_date ON public.purchases(date);
CREATE INDEX idx_purchases_journal_entry ON public.purchases(journal_entry_id);
CREATE INDEX idx_purchase_items_purchase_id ON public.purchase_items(purchase_id);
CREATE INDEX idx_chart_of_accounts_code ON public.chart_of_accounts(account_code);
