import { Card } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Users, Clock, TrendingUp, ArrowUpRight } from "lucide-react";
import type { Order } from "@/hooks/useOrders";
import type { AdminStats } from "@/hooks/useAdminData";
import SalesChart from "./SalesChart";

interface OverviewTabProps {
  stats: AdminStats | null;
  orders: Order[];
  isLoading: boolean;
}

const OverviewTab = ({ stats, orders, isLoading }: OverviewTabProps) => {
  const statCards = [
    {
      icon: ShoppingBag,
      label: "Tổng đơn hàng",
      value: stats?.totalOrders || 0,
      gradient: "from-blue-500 to-cyan-400",
      bgGradient: "from-blue-500/10 to-cyan-400/10",
      iconBg: "bg-blue-500",
      trend: "+12%",
      trendUp: true,
    },
    {
      icon: DollarSign,
      label: "Tổng doanh thu",
      value: `${(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ`,
      gradient: "from-emerald-500 to-green-400",
      bgGradient: "from-emerald-500/10 to-green-400/10",
      iconBg: "bg-emerald-500",
      trend: "+8%",
      trendUp: true,
    },
    {
      icon: Users,
      label: "Tổng người dùng",
      value: stats?.totalUsers || 0,
      gradient: "from-purple-500 to-violet-400",
      bgGradient: "from-purple-500/10 to-violet-400/10",
      iconBg: "bg-purple-500",
      trend: "+24%",
      trendUp: true,
    },
    {
      icon: Clock,
      label: "Đơn chờ xử lý",
      value: stats?.pendingOrders || 0,
      gradient: "from-orange-500 to-amber-400",
      bgGradient: "from-orange-500/10 to-amber-400/10",
      iconBg: "bg-orange-500",
      trend: "-3%",
      trendUp: false,
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const statusStyles = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Chờ xử lý' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đang xử lý' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hoàn thành' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Card 
            key={idx} 
            className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group cursor-default bg-gradient-to-br ${stat.bgGradient}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  <TrendingUp className={`h-4 w-4 ${!stat.trendUp && 'rotate-180'}`} />
                  {stat.trend}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-60`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Sales Chart */}
      <SalesChart orders={orders} />

      {/* Recent Orders with Modern Design */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Đơn hàng gần đây
            </h3>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            recentOrders.map((order, index) => (
              <div 
                key={order.id} 
                className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary font-bold">
                    #{order.id}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{order.customer_info.name}</h4>
                    <p className="text-sm text-muted-foreground">{order.customer_info.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusStyles[order.status].bg} ${statusStyles[order.status].text}`}>
                    {statusStyles[order.status].label}
                  </span>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">{order.total.toLocaleString('vi-VN')}đ</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
