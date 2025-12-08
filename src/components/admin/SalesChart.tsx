import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
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
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              Doanh thu: <span className="font-bold text-primary">{payload[0].value.toLocaleString('vi-VN')}đ</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Số đơn: {payload[0].payload.orders}
            </p>
          </div>
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
  
  // Calculate totals
  const totalMonthlyRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalDailyRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Biểu đồ doanh thu</h3>
              <p className="text-sm text-muted-foreground">Theo dõi doanh thu theo thời gian</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium text-sm">Đang tăng trưởng</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="monthly" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Theo tháng
            </TabsTrigger>
            <TabsTrigger value="daily" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              30 ngày gần đây
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly">
            <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
              <p className="text-sm text-muted-foreground">Tổng doanh thu năm nay</p>
              <p className="text-3xl font-bold text-primary">{totalMonthlyRevenue.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tickFormatter={formatYAxis}
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(263, 70%, 50%)"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    dot={{ fill: 'hsl(263, 70%, 50%)', strokeWidth: 2, r: 4, stroke: 'white' }}
                    activeDot={{ r: 6, fill: 'hsl(263, 70%, 50%)', stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="daily">
            <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
              <p className="text-sm text-muted-foreground">Tổng doanh thu 30 ngày</p>
              <p className="text-3xl font-bold text-primary">{totalDailyRevenue.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorRevenueDaily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    interval={4}
                  />
                  <YAxis 
                    tickFormatter={formatYAxis}
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={3}
                    fill="url(#colorRevenueDaily)"
                    dot={{ fill: 'hsl(217, 91%, 60%)', strokeWidth: 2, r: 3, stroke: 'white' }}
                    activeDot={{ r: 5, fill: 'hsl(217, 91%, 60%)', stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default SalesChart;
