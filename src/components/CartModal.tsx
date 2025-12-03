import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import type { CartItem } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import qrImageFallback from "@/assets/QR.png";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

const CartModal = ({ isOpen, onClose, cart, onRemoveItem, onClearCart }: CartModalProps) => {
  const { user, profile } = useAuth();
  const { createOrder, isSubmitting: isCreating } = useOrders();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [paymentQrUrl, setPaymentQrUrl] = useState<string>("");

  // Fetch payment QR from site settings
  useEffect(() => {
    const fetchPaymentQR = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "payment_qr_url")
          .maybeSingle();
        
        if (data?.value) {
          setPaymentQrUrl(data.value);
        }
      } catch (error) {
        console.error("Error fetching payment QR:", error);
      }
    };
    
    if (isOpen) {
      fetchPaymentQR();
    }
  }, [isOpen]);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = appliedCoupon ? subtotal - appliedCoupon.discount : subtotal;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để áp dụng mã giảm giá!");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: { couponCode: couponCode.toUpperCase(), orderTotal: subtotal }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setAppliedCoupon({ code: data.coupon.code, discount: data.coupon.discount });
      toast.success(`Đã áp dụng mã giảm ${data.coupon.discount.toLocaleString('vi-VN')}đ!`);
    } catch (error: any) {
      toast.error(error.message || "Mã giảm giá không hợp lệ!");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      return;
    }

    try {
      await createOrder(
        user.id,
        cart,
        customerInfo,
        total,
        appliedCoupon?.code
      );
      onClearCart();
      setCustomerInfo({ name: "", phone: "", email: "", note: "" });
      setCouponCode("");
      setAppliedCoupon(null);
      onClose();
    } catch (error) {
      // Error is already handled in createOrder
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">🛒 Giỏ hàng của bạn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cart Items */}
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Giỏ hàng trống</p>
          ) : (
            <>
              {cart.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex-grow">
                    <h4 className="font-semibold">{item.code || item.name}</h4>
                    {item.code && <p className="text-sm text-muted-foreground">{item.name}</p>}
                    {item.type === 'coursera' && item.quantity && (
                      <p className="text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-primary">{item.price.toLocaleString('vi-VN')}đ</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div className="border-t pt-4 space-y-2">
                <label className="block text-sm font-medium">Mã giảm giá</label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                      }}
                    >
                      Hủy
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                    >
                      {isValidatingCoupon ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        "Áp dụng"
                      )}
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-green-600">
                    ✓ Đã áp dụng mã giảm {appliedCoupon.discount.toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{appliedCoupon.discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Customer Info Form */}
              <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
                <h3 className="font-bold text-lg">Thông tin khách hàng</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                  <Input
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                  <Input
                    required
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    required
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú (không bắt buộc)</label>
                  <Textarea
                    value={customerInfo.note}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                    placeholder="Nhập ghi chú..."
                    rows={3}
                  />
                </div>

                {/* QR Code */}
                <div className="bg-muted p-4 rounded-lg text-center">
                  <h4 className="font-bold mb-2">💳 Thông tin thanh toán</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vui lòng quét mã QR để thanh toán
                  </p>
                  <img
                    src={paymentQrUrl || qrImageFallback}
                    alt="QR Code thanh toán"
                    className="max-w-sm mx-auto object-contain"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận đặt hàng"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
