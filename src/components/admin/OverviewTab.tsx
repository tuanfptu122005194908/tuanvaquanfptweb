import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Users, Clock, TrendingUp, ArrowUpRight, Package } from "lucide-react";
import type { Order } from "@/hooks/useOrders";
import type { AdminStats } from "@/hooks/useAdminData";
import SalesChart from "./SalesChart";
import { Badge } from "@/components/ui/badge";

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
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: DollarSign,
      label: "Tổng doanh thu",
      value: `${((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M₫`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      icon: Users,
      label: "Người dùng",
      value: stats?.totalUsers || 0,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Clock,
      label: "Chờ xử lý",
      value: stats?.pendingOrders || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: 'Chờ xử lý', variant: 'secondary' },
    processing: { label: 'Đang xử lý', variant: 'default' },
    completed: { label: 'Hoàn thành', variant: 'outline' },
    cancelled: { label: 'Đã hủy', variant: 'destructive' },
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="border bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart orders={orders} />
        </div>
        
        {/* Quick Stats */}
        <Card className="border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Thống kê nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Đơn hôm nay</span>
                <span className="font-semibold text-foreground">
                  {orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Doanh thu hôm nay</span>
                <span className="font-semibold text-emerald-600">
                  {orders
                    .filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
                    .reduce((sum, o) => sum + o.total, 0)
                    .toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Hoàn thành</span>
                <span className="font-semibold text-foreground">
                  {orders.filter(o => o.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Đã hủy</span>
                <span className="font-semibold text-destructive">
                  {orders.filter(o => o.status === 'cancelled').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border bg-card">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Đơn hàng gần đây
            </CardTitle>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      #{order.id}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.customer_info.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_info.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={statusConfig[order.status]?.variant || 'secondary'}>
                      {statusConfig[order.status]?.label || order.status}
                    </Badge>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{order.total.toLocaleString('vi-VN')}₫</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
