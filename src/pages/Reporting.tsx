
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { getSales, getPurchases, formatCurrency } from "@/lib/storage";

const Reporting = () => {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  useEffect(() => {
    const loadedSales = getSales();
    const loadedPurchases = getPurchases();
    
    setSales(loadedSales);
    setPurchases(loadedPurchases);

    // Calculate totals
    const revenue = loadedSales
      .filter(sale => sale.status === "Paid")
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    const expenses = loadedPurchases
      .filter(purchase => purchase.status === "Received")
      .reduce((sum, purchase) => sum + purchase.amount, 0);
    
    setTotalRevenue(revenue);
    setTotalExpenses(expenses);
    setNetProfit(revenue - expenses);
  }, []);

  const salesByMonth = sales.reduce((acc, sale) => {
    if (sale.status === "Paid") {
      const month = new Date(sale.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + sale.amount;
    }
    return acc;
  }, {});

  const purchasesByMonth = purchases.reduce((acc, purchase) => {
    if (purchase.status === "Received") {
      const month = new Date(purchase.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + purchase.amount;
    }
    return acc;
  }, {});

  const allMonths = [...new Set([...Object.keys(salesByMonth), ...Object.keys(purchasesByMonth)])];

  return (
    <Layout
      title="Reporting"
      subtitle="Financial reports and analytics"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" /> Date Range
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
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
                    <span className="font-medium text-green-600">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total Revenue</span>
                    <span className="text-green-600">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">Expenses</h3>
                  <div className="flex justify-between">
                    <span>Cost of Goods Sold</span>
                    <span className="font-medium text-red-600">{formatCurrency(totalExpenses)}</span>
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
                  const monthRevenue = salesByMonth[month] || 0;
                  const monthExpenses = purchasesByMonth[month] || 0;
                  const monthProfit = monthRevenue - monthExpenses;
                  
                  return (
                    <div key={month} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{month}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <div className="font-medium text-green-600">{formatCurrency(monthRevenue)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Expenses</span>
                          <div className="font-medium text-red-600">{formatCurrency(monthExpenses)}</div>
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
      </Tabs>
    </Layout>
  );
};

export default Reporting;
