import { Card } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Users, Clock } from "lucide-react";
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
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: DollarSign,
      label: "Tổng doanh thu",
      value: `${(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ`,
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: Users,
      label: "Tổng người dùng",
      value: stats?.totalUsers || 0,
      gradient: "from-purple-500 to-violet-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: Clock,
      label: "Đơn chờ xử lý",
      value: stats?.pendingOrders || 0,
      gradient: "from-yellow-500 to-orange-500",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards with Gradient Hover */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Card 
            key={idx} 
            className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] cursor-default group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.iconBg} rounded-lg group-hover:bg-gradient-to-br group-hover:${stat.gradient} transition-all duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor} group-hover:text-white transition-colors duration-300`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sales Chart */}
      <SalesChart orders={orders} />

      {/* Recent Orders */}
      <div>
        <h3 className="text-xl font-bold mb-4">Đơn hàng gần đây</h3>
        <div className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có đơn hàng nào</p>
          ) : (
            recentOrders.map((order) => (
              <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Đơn #{order.id}</h4>
                    <p className="text-sm text-muted-foreground">{order.customer_info.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{order.total.toLocaleString('vi-VN')}đ</p>
                    <p className="text-sm text-muted-foreground">
                      {order.status === 'pending' && '⏳ Chờ xử lý'}
                      {order.status === 'processing' && '📦 Đang xử lý'}
                      {order.status === 'completed' && '✅ Hoàn thành'}
                      {order.status === 'cancelled' && '❌ Đã hủy'}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
