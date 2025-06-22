
-- Create contacts table
CREATE TABLE public.contacts (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('Customer', 'Supplier')),
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample contacts data
INSERT INTO public.contacts (id, name, email, phone, type, balance) VALUES
('C-001', 'Acme Corp', 'contact@acme.com', '(555) 123-4567', 'Customer', 1200000),
('C-002', 'Globex', 'info@globex.com', '(555) 234-5678', 'Customer', 850000),
('C-003', 'Office Supplies Co', 'orders@officesupplies.com', '(555) 345-6789', 'Supplier', 450000),
('C-004', 'Stark Industries', 'info@stark.com', '(555) 456-7890', 'Customer', 3700000),
('C-005', 'Tech Hardware Inc', 'sales@techhardware.com', '(555) 567-8901', 'Supplier', 1275000);
