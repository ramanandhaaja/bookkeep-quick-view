
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Sale, Purchase, JournalEntry, formatCurrency } from './supabaseStorage';

interface ReportData {
  sales: Sale[];
  purchases: Purchase[];
  journalEntries: JournalEntry[];
  dateRange: { from: Date; to: Date };
}

export const generateReportPDF = (data: ReportData) => {
  const doc = new jsPDF();
  const { sales, purchases, journalEntries, dateRange } = data;

  // Title
  doc.setFontSize(20);
  doc.text('Financial Report', 20, 20);
  
  // Date range
  doc.setFontSize(12);
  doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 20, 35);

  // Calculate totals
  const totalRevenue = sales
    .filter(sale => sale.status === "Paid")
    .reduce((sum, sale) => sum + sale.amount, 0) +
    journalEntries.reduce((sum, entry) => sum + entry.totalCredit, 0);

  const totalExpenses = purchases
    .filter(purchase => purchase.status === "Received")
    .reduce((sum, purchase) => sum + purchase.amount, 0) +
    journalEntries.reduce((sum, entry) => sum + entry.totalDebit, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Summary section
  doc.setFontSize(16);
  doc.text('Summary', 20, 55);
  
  doc.setFontSize(12);
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 20, 70);
  doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 20, 80);
  doc.text(`Net ${netProfit >= 0 ? 'Profit' : 'Loss'}: ${formatCurrency(netProfit)}`, 20, 90);

  // Sales table
  if (sales.length > 0) {
    doc.setFontSize(14);
    doc.text('Sales', 20, 110);
    
    const salesData = sales.map(sale => [
      sale.id,
      sale.customer,
      new Date(sale.date).toLocaleDateString(),
      sale.status,
      formatCurrency(sale.amount)
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Customer', 'Date', 'Status', 'Amount']],
      body: salesData,
      startY: 115,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] },
    });
  }

  // Purchases table
  if (purchases.length > 0) {
    const lastY = (doc as any).lastAutoTable?.finalY || 140;
    doc.setFontSize(14);
    doc.text('Purchases', 20, lastY + 20);
    
    const purchasesData = purchases.map(purchase => [
      purchase.id,
      purchase.supplier,
      new Date(purchase.date).toLocaleDateString(),
      purchase.status,
      formatCurrency(purchase.amount)
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Supplier', 'Date', 'Status', 'Amount']],
      body: purchasesData,
      startY: lastY + 25,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] },
    });
  }

  // Journal entries table
  if (journalEntries.length > 0) {
    const lastY = (doc as any).lastAutoTable?.finalY || 160;
    doc.setFontSize(14);
    doc.text('Journal Entries', 20, lastY + 20);
    
    const journalData = journalEntries.map(entry => [
      entry.id,
      entry.description,
      new Date(entry.date).toLocaleDateString(),
      formatCurrency(entry.totalDebit),
      formatCurrency(entry.totalCredit)
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Description', 'Date', 'Debit', 'Credit']],
      body: journalData,
      startY: lastY + 25,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] },
    });
  }

  return doc;
};

export const savePDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};
