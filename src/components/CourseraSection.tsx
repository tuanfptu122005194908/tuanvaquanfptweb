import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Award, Minus, Plus, ShoppingCart, Clock, CheckCircle2 } from "lucide-react";
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
    <section id="coursera" className="section-padding bg-muted/50">
      <div className="container-tight">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-3">Dịch vụ Coursera</p>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground mb-4">
              Hoàn thành MOOC nhanh chóng
            </h2>
            <p className="text-muted-foreground text-lg">
              Tiết kiệm thời gian quý báu để tập trung vào các môn học chính.
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: Clock, text: "Hoàn thành trong 24-48h" },
              { icon: CheckCircle2, text: "Đảm bảo pass 100%" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <item.icon className="h-4 w-4 text-success" />
                <span className="text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="space-y-6">
              {/* Price Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground">
                  <Award className="h-4 w-4" />
                  <span className="font-bold">30,000đ / MOOC</span>
                </div>
              </div>

              {/* Course Name Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tên khóa học
                </label>
                <Input
                  placeholder="Nhập tên khóa học Coursera..."
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="h-12 bg-background border-border"
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
                    className="h-12 w-12"
                    onClick={() => setMoocCount(Math.max(1, moocCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={moocCount}
                    onChange={(e) => setMoocCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center h-12 text-lg font-bold bg-background"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setMoocCount(moocCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-5 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Công thức:</span>
                  <span className="font-mono text-foreground">
                    {moocCount} × {pricePerMooc.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Tổng cộng:</span>
                  <span className="text-2xl font-bold font-display text-primary">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold"
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