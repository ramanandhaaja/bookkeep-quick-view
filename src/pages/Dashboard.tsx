
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

const revenueData = [
  { name: 'Jan', sales: 4000, expenses: 2400 },
  { name: 'Feb', sales: 3000, expenses: 1398 },
  { name: 'Mar', sales: 2000, expenses: 9800 },
  { name: 'Apr', sales: 2780, expenses: 3908 },
  { name: 'May', sales: 1890, expenses: 4800 },
  { name: 'Jun', sales: 2390, expenses: 3800 },
];

const cashflowData = [
  { name: 'Week 1', inflow: 4000, outflow: 2400 },
  { name: 'Week 2', inflow: 3000, outflow: 1398 },
  { name: 'Week 3', inflow: 2000, outflow: 9800 },
  { name: 'Week 4', inflow: 2780, outflow: 3908 },
];

const Dashboard = () => {
  return (
    <Layout title="Dashboard" subtitle="Overview of your financial data">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Revenue" 
          value="$24,780" 
          trend={7.2} 
          icon={<DollarSign className="h-5 w-5 text-accounting-primary" />}
        />
        <StatCard 
          title="Sales" 
          value="145" 
          trend={5.3} 
          icon={<ArrowUpRight className="h-5 w-5 text-accounting-success" />}
        />
        <StatCard 
          title="Expenses" 
          value="$12,450" 
          trend={-2.4} 
          icon={<ArrowDownRight className="h-5 w-5 text-accounting-danger" />}
        />
        <StatCard 
          title="Outstanding" 
          value="$8,570" 
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
                  <Tooltip />
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
                  <Tooltip />
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
              <h3 className="text-lg font-medium">Recent Invoices</h3>
              <a href="/invoices" className="text-sm text-primary hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {[
                { client: 'Acme Inc', amount: '$1,200', status: 'Paid', date: '23 May 2025' },
                { client: 'Globex Corp', amount: '$850', status: 'Pending', date: '21 May 2025' },
                { client: 'Stark Industries', amount: '$3,700', status: 'Overdue', date: '15 May 2025' },
                { client: 'Wayne Enterprises', amount: '$2,150', status: 'Pending', date: '12 May 2025' },
              ].map((invoice, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{invoice.client}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{invoice.amount}</p>
                    <p className={`text-sm ${
                      invoice.status === 'Paid' 
                        ? 'text-accounting-success' 
                        : invoice.status === 'Overdue' 
                          ? 'text-accounting-danger' 
                          : 'text-accounting-warning'
                    }`}>
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Recent Purchase Orders</h3>
              <a href="/purchase-orders" className="text-sm text-primary hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {[
                { supplier: 'Office Supplies Co', amount: '$450', status: 'Fulfilled', date: '22 May 2025' },
                { supplier: 'Tech Hardware Inc', amount: '$1,275', status: 'Pending', date: '20 May 2025' },
                { supplier: 'Business Services Ltd', amount: '$780', status: 'Cancelled', date: '17 May 2025' },
                { supplier: 'Furniture Outlet', amount: '$2,850', status: 'Fulfilled', date: '10 May 2025' },
              ].map((po, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{po.supplier}</p>
                    <p className="text-sm text-muted-foreground">{po.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{po.amount}</p>
                    <p className={`text-sm ${
                      po.status === 'Fulfilled' 
                        ? 'text-accounting-success' 
                        : po.status === 'Cancelled' 
                          ? 'text-accounting-danger' 
                          : 'text-accounting-warning'
                    }`}>
                      {po.status}
                    </p>
                  </div>
                </div>
              ))}
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
