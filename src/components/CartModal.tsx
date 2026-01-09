import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, RefreshCw, Smartphone, CheckCircle2, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);

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

    if (!hasConfirmedPayment) {
      toast.error("Vui lòng xác nhận đã quét mã QR và chuyển khoản!");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      return;
    }

    try {
      // Pass subtotal (not discounted total) to backend - backend will calculate discount
      await createOrder(
        user.id,
        cart,
        customerInfo,
        subtotal, // Send original subtotal, not the discounted total
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
                  <label className="block text-sm font-medium mb-1">Mã sinh viên *</label>
                  <Input
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value.toUpperCase() })}
                    placeholder="VD: SE123456"
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

                {/* QR Code - Highlighted Payment Section */}
                <div className="relative border-2 border-primary rounded-xl overflow-hidden">
                  {/* Animated border glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse pointer-events-none" />
                  
                  <div className="relative bg-gradient-to-b from-primary/5 to-background p-6 text-center">
                    {/* Header with attention-grabbing styling */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                        <AlertTriangle className="h-4 w-4" />
                        QUAN TRỌNG
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                      <Smartphone className="h-6 w-6" />
                      Quét mã QR để thanh toán
                    </h4>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      Vui lòng chuyển khoản <span className="font-bold text-primary">{total.toLocaleString('vi-VN')}đ</span> trước khi xác nhận đơn hàng
                    </p>
                    
                    {/* QR Code with prominent display */}
                    <div className="bg-white p-4 rounded-xl shadow-lg inline-block mb-4 border-2 border-primary/20">
                      <img
                        src={paymentQrUrl || qrImageFallback}
                        alt="QR Code thanh toán"
                        className="max-w-[280px] mx-auto object-contain"
                      />
                    </div>
                    
                    {/* Payment confirmation checkbox */}
                    <div 
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                        hasConfirmedPayment 
                          ? 'bg-green-50 border-green-500 dark:bg-green-950/30' 
                          : 'bg-amber-50 border-amber-400 dark:bg-amber-950/30 animate-pulse'
                      }`}
                    >
                      <Checkbox 
                        id="payment-confirm"
                        checked={hasConfirmedPayment}
                        onCheckedChange={(checked) => setHasConfirmedPayment(Boolean(checked))}
                        className="mt-0.5 h-5 w-5"
                      />
                      <label 
                        htmlFor="payment-confirm" 
                        className="text-left cursor-pointer select-none flex-1"
                      >
                        <span className="font-semibold block mb-1">
                          {hasConfirmedPayment ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Đã xác nhận thanh toán
                            </span>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-400">
                              ⚠️ Tôi đã quét mã QR và chuyển khoản thành công
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Vui lòng tick vào ô này sau khi đã chuyển khoản để xác nhận đơn hàng
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full text-lg py-6 transition-all ${
                    hasConfirmedPayment 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={isCreating || !hasConfirmedPayment}
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : hasConfirmedPayment ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Xác nhận đặt hàng
                    </>
                  ) : (
                    "Vui lòng xác nhận đã thanh toán ở trên ☝️"
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
