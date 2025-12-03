import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Award, Minus, Plus } from "lucide-react";
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
    <section id="coursera" className="py-16 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Award className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Hỗ trợ Rush Coursera
            </h2>
            <p className="text-muted-foreground">
              Dịch vụ hỗ trợ hoàn thành MOOC nhanh chóng - 30,000đ/MOOC
            </p>
          </div>

          <Card className="p-8 shadow-elegant">
            <div className="space-y-6">
              {/* Course Name Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên khóa học / MOOC:
                </label>
                <Input
                  placeholder="Nhập tên khóa học Coursera..."
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* MOOC Count */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số lượng MOOC:
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMoocCount(Math.max(1, moocCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={moocCount}
                    onChange={(e) => setMoocCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMoocCount(moocCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">💰 Công thức:</span>
                  <span className="font-mono">
                    {moocCount} × {pricePerMooc.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full bg-gradient-accent hover:shadow-lg"
                size="lg"
                onClick={handleAddToCart}
              >
                ➕ Thêm vào giỏ hàng
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CourseraSection;
