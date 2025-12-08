import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Phone, Mail, User, Package, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
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
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
  },
  processing: { 
    label: 'Đang xử lý', 
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Loader2,
  },
  completed: { 
    label: 'Hoàn thành', 
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  cancelled: { 
    label: 'Đã hủy', 
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
};

const OrdersTab = ({ orders, isLoading, onRefresh }: OrdersTabProps) => {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

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
    if (!confirm('⚠️ Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác!')) {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
        <div className="text-sm text-muted-foreground">
          Tổng: <span className="font-bold text-foreground">{orders.length}</span> đơn hàng
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Chưa có đơn hàng nào</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            const isExpanded = expandedOrder === order.id;
            
            return (
              <Card 
                key={order.id} 
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Order Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">#{order.id}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">{order.customer_info.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${statusConfig[order.status].className}`}>
                        <StatusIcon className="h-4 w-4" />
                        {statusConfig[order.status].label}
                      </span>
                      <p className="font-bold text-xl text-primary">{order.total.toLocaleString('vi-VN')}đ</p>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t bg-slate-50/30 p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h5 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">Thông tin khách hàng</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Họ tên</p>
                            <p className="font-medium">{order.customer_info.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Số điện thoại</p>
                            <p className="font-medium">{order.customer_info.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium">{order.customer_info.email}</p>
                          </div>
                        </div>
                      </div>
                      {order.customer_info.note && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-sm"><span className="font-medium text-amber-700">Ghi chú:</span> {order.customer_info.note}</p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h5 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">Sản phẩm đặt mua</h5>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {idx + 1}
                              </div>
                              <span className="font-medium">{item.code || item.name}</span>
                            </div>
                            <span className="font-semibold text-primary">{item.price.toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <span className="font-bold text-lg">TỔNG CỘNG</span>
                        <span className="font-bold text-2xl text-primary">{order.total.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={order.status === 'processing'}
                      >
                        <Loader2 className="h-4 w-4 mr-1.5" />
                        Đang xử lý
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={order.status === 'completed'}
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Hoàn thành
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={order.status === 'cancelled'}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Hủy đơn
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteOrder(order.id)}
                        className="ml-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Xóa đơn
                      </Button>
                    </div>
                  </div>
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
