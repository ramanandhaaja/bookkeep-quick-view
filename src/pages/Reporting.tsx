
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { getSales, getPurchases, getJournalEntries, formatCurrency } from "@/lib/supabaseStorage";
import { generateReportPDF, savePDF } from "@/lib/reportGenerator";
import { useToast } from "@/hooks/use-toast";
import DateRangePicker from "@/components/DateRangePicker";

const Reporting = () => {
  const { toast } = useToast();
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    to: new Date() // Today
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load data from Supabase
      const [loadedSales, loadedPurchases, loadedJournalEntries] = await Promise.all([
        getSales(),
        getPurchases(),
        getJournalEntries()
      ]);
      
      setSales(loadedSales);
      setPurchases(loadedPurchases);
      setJournalEntries(loadedJournalEntries);

      // Filter data by date range
      const filteredSales = loadedSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.from && saleDate <= dateRange.to;
      });

      const filteredPurchases = loadedPurchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= dateRange.from && purchaseDate <= dateRange.to;
      });

      const filteredJournalEntries = loadedJournalEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= dateRange.from && entryDate <= dateRange.to;
      });

      // Calculate totals from filtered data
      const revenue = filteredSales
        .filter(sale => sale.status === "Paid")
        .reduce((sum, sale) => sum + sale.amount, 0);
      
      const expenses = filteredPurchases
        .filter(purchase => purchase.status === "Received")
        .reduce((sum, purchase) => sum + purchase.amount, 0);
      
      const journalRevenue = filteredJournalEntries
        .reduce((sum, entry) => sum + entry.totalCredit, 0);
      
      const journalExpenses = filteredJournalEntries
        .reduce((sum, entry) => sum + entry.totalDebit, 0);
      
      const totalRev = revenue + journalRevenue;
      const totalExp = expenses + journalExpenses;
      
      setTotalRevenue(totalRev);
      setTotalExpenses(totalExp);
      setNetProfit(totalRev - totalExp);
    } catch (error) {
      console.error("Error loading report data:", error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const handleExportPDF = () => {
    try {
      // Filter data by date range
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.from && saleDate <= dateRange.to;
      });

      const filteredPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= dateRange.from && purchaseDate <= dateRange.to;
      });

      const filteredJournalEntries = journalEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= dateRange.from && entryDate <= dateRange.to;
      });

      const doc = generateReportPDF({
        sales: filteredSales,
        purchases: filteredPurchases,
        journalEntries: filteredJournalEntries,
        dateRange
      });
      
      const filename = `financial_report_${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}.pdf`;
      savePDF(doc, filename);
      
      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  // Filter data by date range for display
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= dateRange.from && saleDate <= dateRange.to;
  });

  const filteredPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    return purchaseDate >= dateRange.from && purchaseDate <= dateRange.to;
  });

  const filteredJournalEntries = journalEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= dateRange.from && entryDate <= dateRange.to;
  });

  const salesByMonth = filteredSales.reduce((acc, sale) => {
    if (sale.status === "Paid") {
      const month = new Date(sale.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + sale.amount;
    }
    return acc;
  }, {});

  const purchasesByMonth = filteredPurchases.reduce((acc, purchase) => {
    if (purchase.status === "Received") {
      const month = new Date(purchase.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + purchase.amount;
    }
    return acc;
  }, {});

  const journalByMonth = filteredJournalEntries.reduce((acc, entry) => {
    const month = new Date(entry.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    if (!acc[month]) {
      acc[month] = { revenue: 0, expenses: 0 };
    }
    acc[month].revenue += entry.totalCredit;
    acc[month].expenses += entry.totalDebit;
    return acc;
  }, {});

  const allMonths = [...new Set([
    ...Object.keys(salesByMonth), 
    ...Object.keys(purchasesByMonth),
    ...Object.keys(journalByMonth)
  ])];

  if (loading) {
    return (
      <Layout title="Reporting" subtitle="Financial reports and analytics">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading report data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Reporting"
      subtitle="Financial reports and analytics"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
          <TabsTrigger value="journal">Journal Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sales + Journal Credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Purchases + Journal Debits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit-loss">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Revenue</h3>
                  <div className="flex justify-between">
                    <span>Sales Revenue</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(sales.filter(s => s.status === "Paid").reduce((sum, s) => sum + s.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Journal Credits (Manual Entries)</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(journalEntries.reduce((sum, j) => sum + j.totalCredit, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total Revenue</span>
                    <span className="text-green-600">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Expenses</h3>
                  <div className="flex justify-between">
                    <span>Cost of Goods Sold (Purchases)</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(purchases.filter(p => p.status === "Received").reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Journal Debits (Manual Entries)</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(journalEntries.reduce((sum, j) => sum + j.totalDebit, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total Expenses</span>
                    <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className={`flex justify-between text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Net {netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                    <span>{formatCurrency(netProfit)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allMonths.map(month => {
                  const monthSalesRevenue = salesByMonth[month] || 0;
                  const monthPurchaseExpenses = purchasesByMonth[month] || 0;
                  const monthJournalData = journalByMonth[month] || { revenue: 0, expenses: 0 };
                  
                  const monthRevenue = monthSalesRevenue + monthJournalData.revenue;
                  const monthExpenses = monthPurchaseExpenses + monthJournalData.expenses;
                  const monthProfit = monthRevenue - monthExpenses;
                  
                  return (
                    <div key={month} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{month}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <div className="font-medium text-green-600">{formatCurrency(monthRevenue)}</div>
                          <div className="text-xs text-muted-foreground">
                            Sales: {formatCurrency(monthSalesRevenue)} | Journal: {formatCurrency(monthJournalData.revenue)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Expenses</span>
                          <div className="font-medium text-red-600">{formatCurrency(monthExpenses)}</div>
                          <div className="text-xs text-muted-foreground">
                            Purchases: {formatCurrency(monthPurchaseExpenses)} | Journal: {formatCurrency(monthJournalData.expenses)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Profit</span>
                          <div className={`font-medium ${monthProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(monthProfit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle>Manual Journal Entries Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Total Journal Debits</h4>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(journalEntries.reduce((sum, j) => sum + j.totalDebit, 0))}
                    </div>
                    <p className="text-sm text-muted-foreground">Manual expense entries</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Total Journal Credits</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(journalEntries.reduce((sum, j) => sum + j.totalCredit, 0))}
                    </div>
                    <p className="text-sm text-muted-foreground">Manual revenue entries</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recent Journal Entries</h4>
                  <div className="space-y-2">
                    {journalEntries.slice(0, 5).map(entry => (
                      <div key={entry.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="font-medium">{entry.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('id-ID')} 
                            {entry.reference && ` • ${entry.reference}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600">Dr: {formatCurrency(entry.totalDebit)}</div>
                          <div className="text-green-600">Cr: {formatCurrency(entry.totalCredit)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Reporting;
