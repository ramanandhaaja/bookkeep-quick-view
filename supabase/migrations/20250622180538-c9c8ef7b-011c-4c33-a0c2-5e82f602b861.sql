
-- Create categories table
CREATE TABLE public.categories (
  id text NOT NULL DEFAULT concat('CAT-', upper(substring(gen_random_uuid()::text, 1, 7))) PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create items table  
CREATE TABLE public.items (
  id text NOT NULL DEFAULT concat('ITM-', upper(substring(gen_random_uuid()::text, 1, 7))) PRIMARY KEY,
  name text NOT NULL,
  description text,
  category_id text REFERENCES public.categories(id),
  unit_price numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_categories_name ON public.categories(name);
CREATE INDEX idx_categories_active ON public.categories(is_active);
CREATE INDEX idx_items_name ON public.items(name);
CREATE INDEX idx_items_category ON public.items(category_id);
CREATE INDEX idx_items_active ON public.items(is_active);

-- Insert some default categories
INSERT INTO public.categories (name, description) VALUES 
('General', 'General category for miscellaneous items'),
('Electronics', 'Electronic devices and components'),
('Office Supplies', 'Office and administrative supplies'),
('Services', 'Service-based transactions');

-- Insert some default items
INSERT INTO public.items (name, description, unit_price) VALUES 
('Consultation', 'Professional consultation services', 100.00),
('Office Chair', 'Ergonomic office chair', 299.99),
('Laptop', 'Business laptop computer', 1299.99),
('Printer Paper', 'A4 white printer paper (500 sheets)', 12.50);
