import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ClipboardList
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getSales, getPurchases, formatCurrency } from "@/lib/supabaseStorage";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const Dashboard = () => {
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: getPurchases,
  });

  // Calculate stats from real data
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const totalExpenses = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
  const totalSales = sales.length;
  const outstandingAmount = sales
    .filter(sale => sale.status === 'Pending' || sale.status === 'Overdue')
    .reduce((sum, sale) => sum + Number(sale.amount), 0);

  // Generate monthly revenue data for chart
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });
      
      const monthPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= monthStart && purchaseDate <= monthEnd;
      });
      
      const salesTotal = monthSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
      const expensesTotal = monthPurchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
      
      months.push({
        name: format(date, 'MMM'),
        sales: salesTotal,
        expenses: expensesTotal
      });
    }
    return months;
  };

  // Generate weekly cashflow data
  const getWeeklyCashFlow = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - 6);
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - (i * 7));
      
      const weekSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= weekStart && saleDate <= weekEnd && sale.status === 'Paid';
      });
      
      const weekPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate >= weekStart && purchaseDate <= weekEnd;
      });
      
      const inflow = weekSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
      const outflow = weekPurchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
      
      weeks.push({
        name: `Week ${4 - i}`,
        inflow,
        outflow
      });
    }
    return weeks;
  };

  const revenueData = getMonthlyData();
  const cashflowData = getWeeklyCashFlow();

  // Get recent transactions
  const recentSales = sales
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const recentPurchases = purchases
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  if (salesLoading || purchasesLoading) {
    return (
      <Layout title="Dashboard" subtitle="Overview of your financial data">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Overview of your financial data">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Revenue" 
          value={formatCurrency(totalRevenue)} 
          trend={7.2} 
          icon={<DollarSign className="h-5 w-5 text-accounting-primary" />}
        />
        <StatCard 
          title="Sales" 
          value={totalSales.toString()} 
          trend={5.3} 
          icon={<ArrowUpRight className="h-5 w-5 text-accounting-success" />}
        />
        <StatCard 
          title="Expenses" 
          value={formatCurrency(totalExpenses)} 
          trend={-2.4} 
          icon={<ArrowDownRight className="h-5 w-5 text-accounting-danger" />}
        />
        <StatCard 
          title="Outstanding" 
          value={formatCurrency(outstandingAmount)} 
          trend={3.1} 
          icon={<FileText className="h-5 w-5 text-accounting-warning" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Revenue vs Expenses</h3>
              <select className="text-sm bg-transparent border rounded px-2 py-1">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={80} tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                  <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Cash Flow</h3>
              <select className="text-sm bg-transparent border rounded px-2 py-1">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={80} tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                  <Legend />
                  <Bar dataKey="inflow" name="Cash In" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflow" name="Cash Out" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Recent Sales</h3>
              <a href="/sales" className="text-sm text-primary hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{sale.customer}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(sale.date), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(Number(sale.amount))}</p>
                      <p className={`text-sm ${
                        sale.status === 'Paid' 
                          ? 'text-accounting-success' 
                          : sale.status === 'Overdue' 
                            ? 'text-accounting-danger' 
                            : 'text-accounting-warning'
                      }`}>
                        {sale.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Recent Purchases</h3>
              <a href="/purchases" className="text-sm text-primary hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {recentPurchases.length > 0 ? (
                recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{purchase.supplier}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(purchase.date), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(Number(purchase.amount))}</p>
                      <p className={`text-sm ${
                        purchase.status === 'Received' 
                          ? 'text-accounting-success' 
                          : purchase.status === 'Cancelled' 
                            ? 'text-accounting-danger' 
                            : 'text-accounting-warning'
                      }`}>
                        {purchase.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No purchase data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, trend, icon }: StatCardProps) => {
  const isPositive = trend > 0;
  
  return (
    <Card className="stats-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="stats-card-label">{title}</h3>
          {icon}
        </div>
        <p className="stats-card-value">{value}</p>
        <div className={`stats-card-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
          {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          <span>{Math.abs(trend)}% {isPositive ? 'increase' : 'decrease'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
