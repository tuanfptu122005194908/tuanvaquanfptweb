import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/hooks/useOrders";
import { useState } from "react";

interface OrdersTabProps {
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
}

const statusConfig = {
  pending: { 
    label: 'Chờ xử lý', 
    variant: 'secondary' as const,
    icon: Clock,
  },
  processing: { 
    label: 'Đang xử lý', 
    variant: 'default' as const,
    icon: Loader2,
  },
  completed: { 
    label: 'Hoàn thành', 
    variant: 'outline' as const,
    icon: CheckCircle,
  },
  cancelled: { 
    label: 'Đã hủy', 
    variant: 'destructive' as const,
    icon: XCircle,
  },
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
      <Card className="border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Quản lý đơn hàng</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredOrders.length} / {orders.length} đơn hàng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, SĐT, mã đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
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
        <Card className="border bg-card">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchQuery || statusFilter !== "all" 
                ? "Không tìm thấy đơn hàng phù hợp" 
                : "Chưa có đơn hàng nào"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const isExpanded = expandedOrder === order.id;
            
            return (
              <Card key={order.id} className="border bg-card overflow-hidden">
                {/* Order Header */}
                <CardHeader 
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">#{order.id}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{order.customer_info.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={config.variant} className="gap-1">
                        <config.icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      <p className="font-bold text-lg text-foreground hidden sm:block">
                        {order.total.toLocaleString('vi-VN')}₫
                      </p>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Content */}
                {isExpanded && (
                  <CardContent className="border-t bg-muted/20 p-4 space-y-4">
                    {/* Customer Info */}
                    <div className="bg-card rounded-lg p-4 border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Thông tin khách hàng
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Họ tên</p>
                            <p className="font-medium text-foreground">{order.customer_info.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Số điện thoại</p>
                            <p className="font-medium text-foreground">{order.customer_info.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium text-foreground">{order.customer_info.email}</p>
                          </div>
                        </div>
                      </div>
                      {order.customer_info.note && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-sm">
                            <span className="font-medium text-amber-700">Ghi chú:</span> {order.customer_info.note}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="bg-card rounded-lg p-4 border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Sản phẩm đặt mua
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-foreground">{item.code || item.name}</span>
                            </div>
                            <span className="font-semibold text-foreground">{item.price.toLocaleString('vi-VN')}₫</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <span className="font-bold text-foreground">TỔNG CỘNG</span>
                        <span className="font-bold text-xl text-primary">{order.total.toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={order.status === 'processing'}
                        className="gap-1"
                      >
                        <Loader2 className="h-3 w-3" />
                        Đang xử lý
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={order.status === 'completed'}
                        className="gap-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Hoàn thành
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={order.status === 'cancelled'}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <XCircle className="h-3 w-3" />
                        Hủy đơn
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteOrder(order.id)}
                        className="ml-auto gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Xóa
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
