import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X, RefreshCw, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "./ImageUpload";

interface Product {
  id: string;
  type: 'course' | 'document' | 'english';
  code: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  semester?: string;
  services?: string[];
  active: boolean;
  sort_order: number;
}

interface FormData {
  type: 'course' | 'document' | 'english';
  code: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  semester: string;
  services: string;
  active: boolean;
  sort_order: number;
}

const initialFormData: FormData = {
  type: 'course',
  code: '',
  name: '',
  description: '',
  price: 0,
  image_url: '',
  semester: '',
  services: '',
  active: true,
  sort_order: 0,
};

const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [filterType, setFilterType] = useState<string>('all');

  const { uploadImage, isUploading } = useImageUpload({
    bucket: "product-images",
    folder: "products",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error: any) {
      toast.error('Không thể tải sản phẩm: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        type: formData.type,
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        image_url: formData.image_url,
        semester: formData.type === 'document' ? formData.semester : null,
        services: formData.type === 'english' ? formData.services.split(',').map(s => s.trim()).filter(Boolean) : null,
        active: formData.active,
        sort_order: formData.sort_order,
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Đã cập nhật sản phẩm!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Đã thêm sản phẩm mới!');
      }

      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      type: product.type,
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url || '',
      semester: product.semester || '',
      services: product.services?.join(', ') || '',
      active: product.active,
      sort_order: product.sort_order,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Đã xóa sản phẩm!');
      fetchProducts();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !active })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Đã ${!active ? 'bật' : 'tắt'} sản phẩm!`);
      fetchProducts();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const filteredProducts = filterType === 'all' 
    ? products 
    : products.filter(p => p.type === filterType);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course': return 'Khóa học';
      case 'document': return 'Tài liệu';
      case 'english': return 'Tiếng Anh';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="course">Khóa học</SelectItem>
              <SelectItem value="document">Tài liệu</SelectItem>
              <SelectItem value="english">Tiếng Anh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại sản phẩm</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v: 'course' | 'document' | 'english') => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Khóa học</SelectItem>
                    <SelectItem value="document">Tài liệu</SelectItem>
                    <SelectItem value="english">Tiếng Anh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mã sản phẩm</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="VD: MAE101, LUK..."
                  required
                />
              </div>
            </div>

            <div>
              <Label>Tên sản phẩm</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả sản phẩm"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giá (VNĐ)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Thứ tự hiển thị</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Ảnh sản phẩm</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                onUpload={uploadImage}
                isUploading={isUploading}
                placeholder="Tải ảnh"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hoặc nhập URL ảnh trực tiếp:
              </p>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.png"
                className="mt-1"
              />
            </div>

            {formData.type === 'document' && (
              <div>
                <Label>Học kỳ</Label>
                <Input
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="VD: Kỳ 1, Kỳ 2..."
                />
              </div>
            )}

            {formData.type === 'english' && (
              <div>
                <Label>Dịch vụ (phân cách bằng dấu phẩy)</Label>
                <Input
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder="Edit Video, Làm Slide, Hỗ Trợ Debate..."
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(v) => setFormData({ ...formData, active: v })}
              />
              <Label>Đang hoạt động</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Cập nhật' : 'Thêm mới'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Hủy</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={`p-4 ${!product.active ? 'opacity-50' : ''}`}>
            <div className="flex gap-4">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {getTypeLabel(product.type)}
                  </span>
                  <span className="font-bold text-sm">{product.code}</span>
                </div>
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-sm text-primary font-bold">{product.price.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <Switch
                checked={product.active}
                onCheckedChange={() => toggleActive(product.id, product.active)}
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !showForm && (
        <Card className="p-8 text-center text-muted-foreground">
          Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
        </Card>
      )}
    </div>
  );
};

export default ProductsTab;
