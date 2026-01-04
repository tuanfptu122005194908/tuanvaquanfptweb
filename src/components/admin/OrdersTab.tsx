import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Phone, 
  Mail, 
  User, 
  Package, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ShoppingCart,
  Search,
  Filter,
  Calendar,
  CreditCard
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/hooks/useOrders";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OrdersTabProps {
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
}

const statusConfig = {
  pending: { 
    label: 'Chờ xử lý', 
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  processing: { 
    label: 'Đang xử lý', 
    icon: Loader2,
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  completed: { 
    label: 'Hoàn thành', 
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  cancelled: { 
    label: 'Đã hủy', 
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
};

// Generate avatar colors based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'from-pink-400 to-rose-500',
    'from-violet-400 to-purple-500',
    'from-blue-400 to-indigo-500',
    'from-cyan-400 to-teal-500',
    'from-emerald-400 to-green-500',
    'from-amber-400 to-orange-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const OrdersTab = ({ orders, isLoading, onRefresh }: OrdersTabProps) => {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success("Cập nhật trạng thái thành công!");
      onRefresh();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm('⚠️ Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast.success("Xóa đơn hàng thành công!");
      onRefresh();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error("Không thể xóa đơn hàng!");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_info.phone.includes(searchQuery) ||
      order.id.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      {/* Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-card to-muted/30">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Quản lý đơn hàng</h2>
                <p className="text-sm text-muted-foreground">
                  Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, SĐT, mã đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-background/80 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-colors"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-11 bg-background/80 backdrop-blur-sm border-muted-foreground/20">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              {searchQuery || statusFilter !== "all" 
                ? "Không tìm thấy đơn hàng phù hợp" 
                : "Chưa có đơn hàng nào"}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              {searchQuery || statusFilter !== "all" 
                ? "Thử thay đổi bộ lọc tìm kiếm" 
                : "Đơn hàng mới sẽ xuất hiện ở đây"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const isExpanded = expandedOrder === order.id;
            const avatarColor = getAvatarColor(order.customer_info.name);
            const initial = order.customer_info.name.charAt(0).toUpperCase();
            
            return (
              <Card 
                key={order.id} 
                className={cn(
                  "border-0 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md",
                  isExpanded && "ring-2 ring-primary/20"
                )}
              >
                {/* Order Header */}
                <CardHeader 
                  className="p-5 cursor-pointer group"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105",
                      avatarColor
                    )}>
                      <span className="text-xl font-bold text-white drop-shadow-sm">{initial}</span>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {order.customer_info.name}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                          #{order.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right side: Status, Price, Expand */}
                    <div className="flex items-center gap-4">
                      {/* Status Badge */}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors",
                          config.className
                        )}
                      >
                        <config.icon className={cn("h-3.5 w-3.5", order.status === 'processing' && "animate-spin")} />
                        {config.label}
                      </Badge>
                      
                      {/* Price */}
                      <div className="hidden sm:flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-foreground">
                          {order.total.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      
                      {/* Expand Icon */}
                      <div className={cn(
                        "w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center transition-all duration-300",
                        isExpanded && "bg-primary/10 rotate-180"
                      )}>
                        <ChevronDown className={cn(
                          "h-5 w-5 text-muted-foreground transition-colors",
                          isExpanded && "text-primary"
                        )} />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Content */}
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="border-t bg-muted/20 p-5 space-y-5">
                    {/* Customer Info */}
                    <div className="bg-card rounded-xl p-5 border shadow-sm">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Thông tin khách hàng
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Họ tên</p>
                            <p className="font-medium text-foreground">{order.customer_info.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                            <Phone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Số điện thoại</p>
                            <p className="font-medium text-foreground">{order.customer_info.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium text-foreground truncate">{order.customer_info.email}</p>
                          </div>
                        </div>
                      </div>
                      {order.customer_info.note && (
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                          <p className="text-sm">
                            <span className="font-semibold text-amber-700 dark:text-amber-400">📝 Ghi chú:</span>{' '}
                            <span className="text-amber-900 dark:text-amber-300">{order.customer_info.note}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="bg-card rounded-xl p-5 border shadow-sm">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Sản phẩm đặt mua ({order.items.length})
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="flex justify-between items-center p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-foreground">{item.code || item.name}</span>
                            </div>
                            <span className="font-semibold text-foreground">{item.price.toLocaleString('vi-VN')}₫</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center">
                        <span className="font-bold text-muted-foreground">TỔNG CỘNG</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          {order.total.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={order.status === 'processing'}
                        className="gap-1.5 h-10 px-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-all hover:scale-105"
                      >
                        <Loader2 className="h-4 w-4" />
                        Đang xử lý
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={order.status === 'completed'}
                        className="gap-1.5 h-10 px-4 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-all hover:scale-105"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Hoàn thành
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={order.status === 'cancelled'}
                        className="gap-1.5 h-10 px-4 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40 transition-all hover:scale-105"
                      >
                        <XCircle className="h-4 w-4" />
                        Hủy đơn
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteOrder(order.id)}
                        className="ml-auto gap-1.5 h-10 px-4 transition-all hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa đơn
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
