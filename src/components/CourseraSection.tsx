import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Award, Minus, Plus, ShoppingCart, Sparkles } from "lucide-react";
import { useState } from "react";
import type { CartItem } from "@/hooks/useOrders";
import { toast } from "sonner";

interface CourseraSectionProps {
  onAddToCart: (item: CartItem) => void;
}

const CourseraSection = ({ onAddToCart }: CourseraSectionProps) => {
  const [courseName, setCourseName] = useState("");
  const [moocCount, setMoocCount] = useState(1);

  const pricePerMooc = 30000;
  const totalPrice = moocCount * pricePerMooc;

  const handleAddToCart = () => {
    if (!courseName.trim()) {
      toast.error("Vui lòng nhập tên khóa học!");
      return;
    }

    onAddToCart({
      id: `coursera-${Date.now()}`,
      name: `Coursera: ${courseName}`,
      price: totalPrice,
      type: 'coursera',
      quantity: moocCount,
    });

    toast.success(`Đã thêm ${moocCount} MOOC vào giỏ hàng!`);
    setCourseName("");
    setMoocCount(1);
  };

  return (
    <section id="coursera" className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="container-tight relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 mb-6">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Dịch vụ Coursera</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display gradient-text mb-4">
              Hỗ trợ Rush Coursera
            </h2>
            <p className="text-muted-foreground text-lg">
              Dịch vụ hỗ trợ hoàn thành MOOC nhanh chóng và hiệu quả
            </p>
          </div>

          {/* Form Card */}
          <div className="card-premium p-8">
            <div className="space-y-6">
              {/* Price Badge */}
              <div className="flex justify-center mb-2">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-bold">30,000đ / MOOC</span>
                </div>
              </div>

              {/* Course Name Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tên khóa học / MOOC
                </label>
                <Input
                  placeholder="Nhập tên khóa học Coursera..."
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 h-12"
                />
              </div>

              {/* MOOC Count */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Số lượng MOOC
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-border/50 hover:bg-muted/50 hover:border-primary"
                    onClick={() => setMoocCount(Math.max(1, moocCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={moocCount}
                    onChange={(e) => setMoocCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center bg-muted/50 border-border/50 h-12 text-lg font-bold"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-border/50 hover:bg-muted/50 hover:border-primary"
                    onClick={() => setMoocCount(moocCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-6 rounded-2xl bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Công thức tính:</span>
                  <span className="font-mono text-foreground">
                    {moocCount} × {pricePerMooc.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-foreground">Tổng cộng:</span>
                  <span className="text-3xl font-bold font-display gradient-text">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full h-14 bg-gradient-primary hover:opacity-90 text-primary-foreground text-lg font-semibold shadow-elegant"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseraSection;