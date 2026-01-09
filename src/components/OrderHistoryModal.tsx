import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders, type Order } from "@/hooks/useOrders";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  pending: { label: '⏳ Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
  processing: { label: '📦 Đang xử lý', className: 'bg-blue-100 text-blue-800' },
  completed: { label: '✅ Hoàn thành', className: 'bg-green-100 text-green-800' },
  cancelled: { label: '❌ Đã hủy', className: 'bg-red-100 text-red-800' },
};

const OrderHistoryModal = ({ isOpen, onClose }: OrderHistoryModalProps) => {
  const { user } = useAuth();
  const { getUserOrders } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await getUserOrders(user.id);
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải lịch sử đơn hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            🛍️ Lịch sử đơn hàng
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Tổng cộng: {orders.length} đơn hàng
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Đang tải...</p>
          ) : orders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Chưa có đơn hàng nào</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 space-y-3">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Đơn hàng #{order.id}</h4>
                  <p className="text-sm text-muted-foreground">
                    📅 {new Date(order.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].className}`}>
                    {statusConfig[order.status].label}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">Sản phẩm:</p>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>• {item.code || item.name}</span>
                      <span className="font-medium">{item.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{order.total.toLocaleString('vi-VN')}đ</span>
                </div>

                {/* Expand Details */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  {expandedOrder === order.id ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Ẩn thông tin giao hàng
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Xem thông tin giao hàng
                    </>
                  )}
                </Button>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <p><span className="font-medium">Người nhận:</span> {order.customer_info.name}</p>
                    <p><span className="font-medium">Mã sinh viên:</span> {order.customer_info.phone}</p>
                    <p><span className="font-medium">Email:</span> {order.customer_info.email}</p>
                    {order.customer_info.note && (
                      <p><span className="font-medium">Ghi chú:</span> {order.customer_info.note}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="sticky bottom-0 bg-background pt-4 border-t">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderHistoryModal;
