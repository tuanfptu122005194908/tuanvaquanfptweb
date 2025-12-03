import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

const CouponsTab = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_value: '0',
    max_uses: '',
    expires_at: '',
    active: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons((data as Coupon[]) || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error("Không thể tải danh sách mã giảm giá!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '0',
      max_uses: '',
      expires_at: '',
      active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_value: parseFloat(formData.min_order_value) || 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at || null,
      active: formData.active,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Cập nhật mã giảm giá thành công!");
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);

        if (error) throw error;
        toast.success("Tạo mã giảm giá thành công!");
      }

      resetForm();
      fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      if (error.code === '23505') {
        toast.error("Mã giảm giá đã tồn tại!");
      } else {
        toast.error("Không thể lưu mã giảm giá!");
      }
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_value: coupon.min_order_value.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
      active: coupon.active,
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa mã "${code}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Xóa mã giảm giá thành công!");
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error("Không thể xóa mã giảm giá!");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success("Cập nhật trạng thái thành công!");
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Quản lý mã giảm giá</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo mã mới
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h4 className="font-bold mb-4">{editingId ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mã giảm giá *</Label>
                <Input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                />
              </div>

              <div>
                <Label>Loại giảm giá *</Label>
                <Select 
                  value={formData.discount_type} 
                  onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (đ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Giá trị giảm *</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percentage' ? '10' : '50000'}
                />
              </div>

              <div>
                <Label>Giá trị đơn hàng tối thiểu</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Số lượng sử dụng tối đa</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Không giới hạn"
                />
              </div>

              <div>
                <Label>Ngày hết hạn</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label>Kích hoạt mã</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Cập nhật' : 'Tạo mã'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Hủy</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg">{coupon.code}</h4>
                <p className="text-sm text-muted-foreground">
                  {coupon.discount_type === 'percentage' 
                    ? `Giảm ${coupon.discount_value}%` 
                    : `Giảm ${coupon.discount_value.toLocaleString('vi-VN')}đ`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(coupon)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(coupon.id, coupon.code)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 text-sm mb-3">
              <p>📦 Đơn tối thiểu: {coupon.min_order_value.toLocaleString('vi-VN')}đ</p>
              <p>🔢 Đã dùng: {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}</p>
              {coupon.expires_at && (
                <p>📅 Hết hạn: {new Date(coupon.expires_at).toLocaleDateString('vi-VN')}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {coupon.active ? '✅ Đang hoạt động' : '❌ Ngừng hoạt động'}
              </span>
              <Switch
                checked={coupon.active}
                onCheckedChange={() => toggleActive(coupon.id, coupon.active)}
              />
            </div>
          </Card>
        ))}
      </div>

      {coupons.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">Chưa có mã giảm giá nào</p>
      )}
    </div>
  );
};

export default CouponsTab;
