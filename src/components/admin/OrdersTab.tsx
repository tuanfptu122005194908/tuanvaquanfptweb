import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/hooks/useOrders";

interface OrdersTabProps {
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
}

const statusConfig = {
  pending: { label: '⏳ Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
  processing: { label: '📦 Đang xử lý', className: 'bg-blue-100 text-blue-800' },
  completed: { label: '✅ Hoàn thành', className: 'bg-green-100 text-green-800' },
  cancelled: { label: '❌ Đã hủy', className: 'bg-red-100 text-red-800' },
};

const OrdersTab = ({ orders, isLoading, onRefresh }: OrdersTabProps) => {
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
    return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Chưa có đơn hàng nào</p>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="p-6">
            {/* Order Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-lg">Đơn hàng #{order.id}</h4>
                <p className="text-sm text-muted-foreground">
                  📅 {new Date(order.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].className}`}>
                {statusConfig[order.status].label}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h5 className="font-semibold mb-2">👤 Thông tin khách hàng</h5>
              <p className="text-sm"><span className="font-medium">Tên:</span> {order.customer_info.name}</p>
              <p className="text-sm"><span className="font-medium">SĐT:</span> {order.customer_info.phone}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {order.customer_info.email}</p>
              {order.customer_info.note && (
                <p className="text-sm"><span className="font-medium">Ghi chú:</span> {order.customer_info.note}</p>
              )}
            </div>

            {/* Items */}
            <div className="mb-4">
              <h5 className="font-semibold mb-2">🛍️ Sản phẩm</h5>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.code || item.name}</span>
                    <span className="font-medium">{item.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>TỔNG CỘNG</span>
                <span className="text-primary">{order.total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateOrderStatus(order.id, 'processing')}
                disabled={order.status === 'processing'}
              >
                Đang xử lý
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => updateOrderStatus(order.id, 'completed')}
                disabled={order.status === 'completed'}
              >
                Hoàn thành
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                disabled={order.status === 'cancelled'}
              >
                Hủy đơn
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteOrder(order.id)}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đơn
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default OrdersTab;
