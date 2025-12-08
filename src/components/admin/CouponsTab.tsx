import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit, X, Ticket, Percent, DollarSign, Calendar, Hash, ShoppingCart } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý mã giảm giá</h2>
          <p className="text-muted-foreground">Tổng: {coupons.length} mã</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-primary hover:opacity-90"
        >
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? 'Đóng' : 'Tạo mã mới'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            {editingId ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mã giảm giá *</Label>
                <Input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: SUMMER2024"
                  className="font-mono uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Loại giảm giá *</Label>
                <Select 
                  value={formData.discount_type} 
                  onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Phần trăm (%)
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Số tiền cố định (đ)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Giá trị giảm *</Label>
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

              <div className="space-y-2">
                <Label className="text-sm font-medium">Giá trị đơn tối thiểu</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Số lần sử dụng tối đa</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Không giới hạn"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Ngày hết hạn</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label className="cursor-pointer">Kích hoạt mã ngay</Label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                {editingId ? 'Cập nhật' : 'Tạo mã'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>Hủy</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Coupons Grid */}
      {coupons.length === 0 && !showForm ? (
        <Card className="p-12 text-center border-0 shadow-lg">
          <Ticket className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Chưa có mã giảm giá nào</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <Card 
              key={coupon.id} 
              className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${!coupon.active && 'opacity-60'}`}
            >
              <div className={`h-2 ${coupon.active ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-slate-300'}`} />
              
              <div className="p-5">
                {/* Code Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-primary/10 text-primary font-bold font-mono rounded-lg text-lg">
                        {coupon.code}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {coupon.discount_type === 'percentage' 
                        ? `Giảm ${coupon.discount_value}%` 
                        : `Giảm ${coupon.discount_value.toLocaleString('vi-VN')}đ`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(coupon)} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(coupon.id, coupon.code)} className="h-8 w-8 text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Đơn tối thiểu: {coupon.min_order_value.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>Đã dùng: {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ' (không giới hạn)'}</span>
                  </div>
                  {coupon.expires_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Hết hạn: {new Date(coupon.expires_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    coupon.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {coupon.active ? '✓ Đang hoạt động' : '✕ Đã tắt'}
                  </span>
                  <Switch
                    checked={coupon.active}
                    onCheckedChange={() => toggleActive(coupon.id, coupon.active)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponsTab;
