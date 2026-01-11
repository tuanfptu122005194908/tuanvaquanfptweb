import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Order, CartItem } from "@/hooks/useOrders";
import { Save, Plus, Trash2, Package } from "lucide-react";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: () => void;
}

const EditOrderModal = ({ isOpen, onClose, order, onSave }: EditOrderModalProps) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setCustomerName(order.customer_info.name);
      setCustomerPhone(order.customer_info.phone);
      setCustomerEmail(order.customer_info.email);
      setCustomerNote(order.customer_info.note || "");
      setItems([...order.items]);
    }
  }, [order]);

  const updateItem = (index: number, field: keyof CartItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("Đơn hàng phải có ít nhất 1 sản phẩm!");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: "Sản phẩm mới",
        price: 0,
        type: "course" as const,
      },
    ]);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSave = async () => {
    if (!order) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin khách hàng!");
      return;
    }

    if (items.length === 0) {
      toast.error("Đơn hàng phải có ít nhất 1 sản phẩm!");
      return;
    }

    setIsSubmitting(true);
    try {
      const newTotal = calculateTotal();
      
      // Convert items to JSON-compatible format
      const itemsJson = items.map(item => ({
        id: item.id,
        code: item.code || null,
        name: item.name,
        price: item.price,
        type: item.type,
        quantity: item.quantity || 1,
        moocName: item.moocName || null,
      }));
      
      const { error } = await supabase
        .from("orders")
        .update({
          customer_info: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim(),
            note: customerNote.trim() || null,
          } as never,
          items: itemsJson as never,
          total: newTotal,
        })
        .eq("id", order.id);

      if (error) throw error;

      toast.success("Cập nhật đơn hàng thành công!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Không thể cập nhật đơn hàng!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-primary" />
            Chỉnh sửa đơn hàng #{order.id}
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin khách hàng và sản phẩm trong đơn hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ tên</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nhập họ tên khách hàng"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mã sinh viên</Label>
                <Input
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="VD: SE12345"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@fpt.edu.vn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Ghi chú thêm (tùy chọn)"
                rows={2}
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Sản phẩm ({items.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Thêm SP
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                >
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      value={item.code || item.name}
                      onChange={(e) =>
                        updateItem(index, item.code ? "code" : "name", e.target.value)
                      }
                      placeholder="Tên sản phẩm"
                      className="h-9"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", parseFloat(e.target.value) || 0)
                        }
                        placeholder="Giá"
                        className="h-9"
                      />
                      <span className="text-sm text-muted-foreground">₫</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
              <span className="font-semibold text-muted-foreground">TỔNG CỘNG</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {calculateTotal().toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderModal;
