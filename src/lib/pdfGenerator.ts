
import jsPDF from 'jspdf';
import { Sale, Invoice, Purchase, PurchaseOrder } from './storage';

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

// Common function to set up PDF document
const setupDocument = (title: string): jsPDF => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text("ACME ACCOUNTING", 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text("123 Business Street, City, Country", 105, 27, { align: 'center' });
  doc.text("Phone: (555) 123-4567 | Email: accounts@acme.com", 105, 32, { align: 'center' });
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 105, 45, { align: 'center' });
  
  // Add horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 50, 190, 50);
  
  return doc;
};

// Function to add items table
const addItemsTable = (
  doc: jsPDF, 
  items: { description: string; quantity: number; unitPrice: number }[],
  startY: number
): number => {
  // Table header
  doc.setFont("helvetica", "bold");
  doc.text("Item Description", 20, startY);
  doc.text("Qty", 130, startY);
  doc.text("Unit Price", 150, startY);
  doc.text("Amount", 180, startY);
  
  doc.setLineWidth(0.2);
  doc.line(20, startY + 2, 190, startY + 2);
  
  doc.setFont("helvetica", "normal");
  
  let currentY = startY + 10;
  let total = 0;
  
  // Table rows
  items.forEach(item => {
    const amount = item.quantity * item.unitPrice;
    total += amount;
    
    doc.text(item.description.substring(0, 40), 20, currentY);
    doc.text(item.quantity.toString(), 130, currentY);
    doc.text(formatCurrency(item.unitPrice), 150, currentY);
    doc.text(formatCurrency(amount), 180, currentY);
    
    currentY += 7;
    
    // Add a new page if we're running out of space
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
  });
  
  // Total
  doc.line(20, currentY, 190, currentY);
  currentY += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 150, currentY);
  doc.text(formatCurrency(total), 180, currentY);
  
  return currentY;
};

// Generate Sale PDF
export const generateSalePDF = (sale: Sale): jsPDF => {
  const doc = setupDocument("SALES RECEIPT");
  
  // Add sale details
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", 20, 60);
  doc.text("Date:", 20, 67);
  doc.text("Customer:", 20, 74);
  doc.text("Status:", 20, 81);
  
  doc.setFont("helvetica", "normal");
  doc.text(sale.id, 70, 60);
  doc.text(formatDate(sale.date), 70, 67);
  doc.text(sale.customer, 70, 74);
  doc.text(sale.status, 70, 81);
  
  // Add items table
  addItemsTable(doc, sale.items, 95);
  
  // Notes section if available
  if (sale.notes) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(sale.notes, 20, 27);
  }
  
  return doc;
};

// Generate Invoice PDF
export const generateInvoicePDF = (invoice: Invoice): jsPDF => {
  const doc = setupDocument("INVOICE");
  
  // Add invoice details
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No:", 20, 60);
  doc.text("Date:", 20, 67);
  doc.text("Due Date:", 20, 74);
  doc.text("Customer:", 20, 81);
  doc.text("Status:", 20, 88);
  
  doc.setFont("helvetica", "normal");
  doc.text(invoice.id, 70, 60);
  doc.text(formatDate(invoice.date), 70, 67);
  doc.text(formatDate(invoice.dueDate), 70, 74);
  doc.text(invoice.customer, 70, 81);
  doc.text(invoice.status, 70, 88);
  
  // Add items table
  const finalY = addItemsTable(doc, invoice.items, 105);
  
  // Payment information
  doc.setFont("helvetica", "bold");
  doc.text("Payment Information:", 20, finalY + 15);
  doc.setFont("helvetica", "normal");
  doc.text("Bank: ACME Bank", 20, finalY + 22);
  doc.text("Account: 123456789", 20, finalY + 29);
  doc.text("Reference: " + invoice.id, 20, finalY + 36);
  
  // Terms and conditions
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 20, finalY + 46);
  doc.setFont("helvetica", "normal");
  doc.text("Payment due within 15 days. Late payments subject to 2% fee.", 20, finalY + 53);
  
  // Notes section if available
  if (invoice.notes) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.notes, 20, 27);
  }
  
  return doc;
};

// Generate Purchase PDF
export const generatePurchasePDF = (purchase: Purchase): jsPDF => {
  const doc = setupDocument("PURCHASE RECORD");
  
  // Add purchase details
  doc.setFont("helvetica", "bold");
  doc.text("Purchase No:", 20, 60);
  doc.text("Date:", 20, 67);
  doc.text("Supplier:", 20, 74);
  doc.text("Status:", 20, 81);
  
  doc.setFont("helvetica", "normal");
  doc.text(purchase.id, 70, 60);
  doc.text(formatDate(purchase.date), 70, 67);
  doc.text(purchase.supplier, 70, 74);
  doc.text(purchase.status, 70, 81);
  
  // Add items table
  addItemsTable(doc, purchase.items, 95);
  
  // Notes section if available
  if (purchase.notes) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(purchase.notes, 20, 27);
  }
  
  return doc;
};

// Generate Purchase Order PDF
export const generatePurchaseOrderPDF = (po: PurchaseOrder): jsPDF => {
  const doc = setupDocument("PURCHASE ORDER");
  
  // Add PO details
  doc.setFont("helvetica", "bold");
  doc.text("PO Number:", 20, 60);
  doc.text("Date:", 20, 67);
  doc.text("Delivery Date:", 20, 74);
  doc.text("Supplier:", 20, 81);
  doc.text("Status:", 20, 88);
  
  doc.setFont("helvetica", "normal");
  doc.text(po.id, 70, 60);
  doc.text(formatDate(po.date), 70, 67);
  doc.text(formatDate(po.deliveryDate), 70, 74);
  doc.text(po.supplier, 70, 81);
  doc.text(po.status, 70, 88);
  
  // Add items table
  const finalY = addItemsTable(doc, po.items, 105);
  
  // Delivery information
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Address:", 20, finalY + 15);
  doc.setFont("helvetica", "normal");
  doc.text("ACME Corporation", 20, finalY + 22);
  doc.text("123 Business Street", 20, finalY + 29);
  doc.text("City, Country, ZIP", 20, finalY + 36);
  
  // Terms
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 20, finalY + 46);
  doc.setFont("helvetica", "normal");
  doc.text("Please confirm receipt of this purchase order within 2 business days.", 20, finalY + 53);
  
  // Notes section if available
  if (po.notes) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(po.notes, 20, 27);
  }
  
  return doc;
};

// Save PDF function
export const savePDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};
