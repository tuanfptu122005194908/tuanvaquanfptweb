import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Order } from "@/hooks/useOrders";

interface SalesChartProps {
  orders: Order[];
}

const SalesChart = ({ orders }: SalesChartProps) => {
  // Generate monthly data
  const getMonthlyData = () => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData = months.map((month, index) => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getFullYear() === currentYear && orderDate.getMonth() === index;
      });
      
      const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = monthOrders.length;
      
      return {
        name: month,
        revenue,
        orders: orderCount,
      };
    });
    
    return monthlyData;
  };

  // Generate daily data (last 30 days)
  const getDailyData = () => {
    const dailyData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = dayOrders.length;
      
      dailyData.push({
        name: dateStr,
        revenue,
        orders: orderCount,
      });
    }
    
    return dailyData;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-sm" style={{ color: '#990033' }}>
            Doanh thu: {payload[0].value.toLocaleString('vi-VN')}đ
          </p>
          <p className="text-sm text-muted-foreground">
            Số đơn: {payload[0].payload.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const monthlyData = getMonthlyData();
  const dailyData = getDailyData();

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Biểu đồ doanh thu</h3>
      
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="monthly">Theo tháng</TabsTrigger>
          <TabsTrigger value="daily">Theo ngày</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#990033"
                  strokeWidth={3}
                  dot={{ fill: '#990033', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#990033' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="daily">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  interval={4}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#990033"
                  strokeWidth={3}
                  dot={{ fill: '#990033', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: '#990033' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SalesChart;
