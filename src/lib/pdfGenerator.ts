
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

// Common function to set up PDF document with enhanced styling
const setupDocument = (title: string): jsPDF => {
  const doc = new jsPDF();
  
  // Add stylish header with gradient-like effect
  doc.setFillColor(41, 65, 148); // Dark blue
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFillColor(59, 89, 171); // Lighter blue
  doc.rect(0, 30, 210, 10, 'F');
  
  // Add company name with better styling
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ACME ACCOUNTING", 105, 20, { align: 'center' });
  
  // Add company details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("123 Business Street, City, Country", 105, 28, { align: 'center' });
  doc.text("Phone: (555) 123-4567 | Email: accounts@acme.com", 105, 35, { align: 'center' });
  
  // Add document title
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(0, 45, 210, 10, 'F');
  doc.setTextColor(41, 65, 148); // Dark blue text
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 105, 51, { align: 'center' });
  
  // Reset text color to black for the rest of the document
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  return doc;
};

// Enhanced function to add items table
const addItemsTable = (
  doc: jsPDF, 
  items: { description: string; quantity: number; unitPrice: number }[],
  startY: number
): number => {
  // Table header with improved styling
  doc.setFillColor(230, 230, 230); // Light gray background
  doc.rect(20, startY - 5, 170, 10, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Item Description", 22, startY);
  doc.text("Qty", 130, startY);
  doc.text("Unit Price", 150, startY);
  doc.text("Amount", 180, startY);
  
  doc.setLineWidth(0.1);
  doc.line(20, startY + 2, 190, startY + 2);
  
  doc.setFont("helvetica", "normal");
  
  let currentY = startY + 10;
  let total = 0;
  let rowCount = 0;
  
  // Table rows with alternating colors
  items.forEach(item => {
    const amount = item.quantity * item.unitPrice;
    total += amount;
    
    // Add alternating row colors
    if (rowCount % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, currentY - 5, 170, 7, 'F');
    }
    
    doc.text(item.description.substring(0, 40), 22, currentY);
    doc.text(item.quantity.toString(), 130, currentY);
    doc.text(formatCurrency(item.unitPrice), 150, currentY);
    doc.text(formatCurrency(amount), 180, currentY);
    
    currentY += 7;
    rowCount++;
    
    // Add a new page if we're running out of space
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
      rowCount = 0;
    }
  });
  
  // Total with better styling
  doc.setDrawColor(41, 65, 148); // Dark blue line
  doc.setLineWidth(0.5);
  doc.line(20, currentY, 190, currentY);
  currentY += 7;
  
  // Add total box
  doc.setFillColor(41, 65, 148); // Dark blue
  doc.rect(130, currentY - 5, 60, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 140, currentY);
  doc.text(formatCurrency(total), 180, currentY);
  
  // Reset text color to black
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  return currentY + 10;
};

// Generate Sale PDF with improved styling
export const generateSalePDF = (sale: Sale): jsPDF => {
  const doc = setupDocument("SALES RECEIPT");
  
  // Add sale details with improved layout
  doc.setFillColor(248, 248, 248); // Very light gray background
  doc.rect(20, 60, 170, 30, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", 25, 70);
  doc.text("Date:", 25, 77);
  doc.text("Customer:", 25, 84);
  
  doc.setFont("helvetica", "normal");
  doc.text(sale.id, 70, 70);
  doc.text(formatDate(sale.date), 70, 77);
  doc.text(sale.customer, 70, 84);
  
  // Add status with color indicator
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 130, 70);
  
  // Color-coded status
  switch(sale.status) {
    case "Paid":
      doc.setTextColor(46, 125, 50); // Green
      break;
    case "Pending":
      doc.setTextColor(237, 108, 2); // Orange
      break;
    case "Overdue":
      doc.setTextColor(211, 47, 47); // Red
      break;
  }
  
  doc.text(sale.status, 160, 70);
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add items table
  addItemsTable(doc, sale.items, 105);
  
  // Notes section if available
  if (sale.notes) {
    doc.setFillColor(248, 248, 248);
    doc.rect(20, 200, 170, 30, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 25, 210);
    doc.setFont("helvetica", "normal");
    doc.text(sale.notes, 25, 220);
  }
  
  // Add footer
  doc.setFillColor(41, 65, 148); // Dark blue
  doc.rect(0, 280, 210, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 105, 286, { align: 'center' });
  
  return doc;
};

// Generate Invoice PDF with improved styling
export const generateInvoicePDF = (invoice: Invoice): jsPDF => {
  const doc = setupDocument("INVOICE");
  
  // Add invoice details with improved layout
  doc.setFillColor(248, 248, 248); // Very light gray background
  doc.rect(20, 60, 170, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No:", 25, 70);
  doc.text("Date:", 25, 77);
  doc.text("Due Date:", 25, 84);
  doc.text("Customer:", 25, 91);
  
  doc.setFont("helvetica", "normal");
  doc.text(invoice.id, 70, 70);
  doc.text(formatDate(invoice.date), 70, 77);
  doc.text(formatDate(invoice.dueDate), 70, 84);
  doc.text(invoice.customer, 70, 91);
  
  // Add status with color indicator
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 130, 70);
  
  // Color-coded status
  switch(invoice.status) {
    case "Paid":
      doc.setTextColor(46, 125, 50); // Green
      break;
    case "Pending":
      doc.setTextColor(237, 108, 2); // Orange
      break;
    case "Overdue":
      doc.setTextColor(211, 47, 47); // Red
      break;
  }
  
  doc.text(invoice.status, 160, 70);
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add items table
  const finalY = addItemsTable(doc, invoice.items, 115);
  
  // Payment information with improved styling
  doc.setFillColor(240, 240, 250); // Light blue background
  doc.rect(20, finalY, 80, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("Payment Information:", 25, finalY + 10);
  doc.setFont("helvetica", "normal");
  doc.text("Bank: ACME Bank", 25, finalY + 17);
  doc.text("Account: 123456789", 25, finalY + 24);
  doc.text("Reference: " + invoice.id, 25, finalY + 31);
  
  // Terms and conditions with improved styling
  doc.setFillColor(250, 240, 240); // Light red background
  doc.rect(110, finalY, 80, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 115, finalY + 10);
  doc.setFont("helvetica", "normal");
  doc.text("Payment due within 15 days.", 115, finalY + 17);
  doc.text("Late payments subject to 2% fee.", 115, finalY + 24);
  
  // Notes section if available
  if (invoice.notes) {
    doc.setFillColor(248, 248, 248);
    doc.rect(20, finalY + 50, 170, 30, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 25, finalY + 60);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.notes, 25, finalY + 67);
  }
  
  // Add footer
  doc.setFillColor(41, 65, 148); // Dark blue
  doc.rect(0, 280, 210, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 105, 286, { align: 'center' });
  
  return doc;
};

// Generate Purchase PDF with improved styling
export const generatePurchasePDF = (purchase: Purchase): jsPDF => {
  const doc = setupDocument("PURCHASE RECORD");
  
  // Add purchase details with improved layout
  doc.setFillColor(248, 248, 248); // Very light gray background
  doc.rect(20, 60, 170, 30, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("Purchase No:", 25, 70);
  doc.text("Date:", 25, 77);
  doc.text("Supplier:", 25, 84);
  
  doc.setFont("helvetica", "normal");
  doc.text(purchase.id, 70, 70);
  doc.text(formatDate(purchase.date), 70, 77);
  doc.text(purchase.supplier, 70, 84);
  
  // Add status with color indicator
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 130, 70);
  
  // Color-coded status
  switch(purchase.status) {
    case "Received":
      doc.setTextColor(46, 125, 50); // Green
      break;
    case "Pending":
      doc.setTextColor(237, 108, 2); // Orange
      break;
    case "Cancelled":
      doc.setTextColor(211, 47, 47); // Red
      break;
  }
  
  doc.text(purchase.status, 160, 70);
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add items table
  addItemsTable(doc, purchase.items, 105);
  
  // Notes section if available
  if (purchase.notes) {
    doc.setFillColor(248, 248, 248);
    doc.rect(20, 200, 170, 30, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 25, 210);
    doc.setFont("helvetica", "normal");
    doc.text(purchase.notes, 25, 220);
  }
  
  // Add footer
  doc.setFillColor(41, 65, 148); // Dark blue
  doc.rect(0, 280, 210, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 105, 286, { align: 'center' });
  
  return doc;
};

// Generate Purchase Order PDF with improved styling
export const generatePurchaseOrderPDF = (po: PurchaseOrder): jsPDF => {
  const doc = setupDocument("PURCHASE ORDER");
  
  // Add PO details with improved layout
  doc.setFillColor(248, 248, 248); // Very light gray background
  doc.rect(20, 60, 170, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("PO Number:", 25, 70);
  doc.text("Date:", 25, 77);
  doc.text("Delivery Date:", 25, 84);
  doc.text("Supplier:", 25, 91);
  
  doc.setFont("helvetica", "normal");
  doc.text(po.id, 70, 70);
  doc.text(formatDate(po.date), 70, 77);
  doc.text(formatDate(po.deliveryDate), 70, 84);
  doc.text(po.supplier, 70, 91);
  
  // Add status with color indicator
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 130, 70);
  
  // Color-coded status
  switch(po.status) {
    case "Fulfilled":
      doc.setTextColor(46, 125, 50); // Green
      break;
    case "Pending":
      doc.setTextColor(237, 108, 2); // Orange
      break;
    case "Cancelled":
      doc.setTextColor(211, 47, 47); // Red
      break;
  }
  
  doc.text(po.status, 160, 70);
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add items table
  const finalY = addItemsTable(doc, po.items, 115);
  
  // Delivery information with improved styling
  doc.setFillColor(240, 240, 250); // Light blue background
  doc.rect(20, finalY, 80, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Address:", 25, finalY + 10);
  doc.setFont("helvetica", "normal");
  doc.text("ACME Corporation", 25, finalY + 17);
  doc.text("123 Business Street", 25, finalY + 24);
  doc.text("City, Country, ZIP", 25, finalY + 31);
  
  // Terms with improved styling
  doc.setFillColor(250, 240, 240); // Light red background
  doc.rect(110, finalY, 80, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 115, finalY + 10);
  doc.setFont("helvetica", "normal");
  doc.text("Please confirm receipt of this", 115, finalY + 17);
  doc.text("purchase order within 2 business days.", 115, finalY + 24);
  
  // Notes section if available
  if (po.notes) {
    doc.setFillColor(248, 248, 248);
    doc.rect(20, finalY + 50, 170, 30, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 25, finalY + 60);
    doc.setFont("helvetica", "normal");
    doc.text(po.notes, 25, finalY + 67);
  }
  
  // Add footer
  doc.setFillColor(41, 65, 148); // Dark blue
  doc.rect(0, 280, 210, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 105, 286, { align: 'center' });
  
  return doc;
};

// Save PDF function
export const savePDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};
