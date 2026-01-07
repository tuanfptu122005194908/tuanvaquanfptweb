import { Button } from "@/components/ui/button";
import { ShoppingCart, BookOpen, Clock, TrendingUp } from "lucide-react";
import type { CartItem } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

interface CourseSectionProps {
  onAddToCart: (item: CartItem) => void;
}

const CourseSection = ({ onAddToCart }: CourseSectionProps) => {
  const { products: courses, isLoading } = useProducts('course');

  const handleAddToCart = (course: typeof courses[0]) => {
    onAddToCart({
      id: course.id,
      code: course.code,
      name: course.name,
      price: course.price,
      type: 'course',
    });
    toast.success(`Đã thêm ${course.code} vào giỏ hàng!`);
  };

  if (isLoading) {
    return (
      <section id="courses" className="section-padding bg-background">
        <div className="container-tight">
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section id="courses" className="section-padding bg-background">
      <div className="container-tight">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-3">Khóa học nổi bật</p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground mb-4">
            Đầu tư thông minh cho điểm số của bạn
          </h2>
          <p className="text-muted-foreground text-lg">
            Mỗi khóa học được thiết kế để giúp bạn nắm vững kiến thức và đạt điểm cao trong thời gian ngắn nhất.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col animate-slide-up opacity-0"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden bg-muted">
                {course.image_url ? (
                  <img 
                    src={course.image_url} 
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/90 text-xs font-bold text-primary">
                  {course.code}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold font-display text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {course.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">
                  {course.description || "Hỗ trợ ôn tập và đạt điểm cao"}
                </p>
                
                {/* Benefits tags */}
                <div className="flex gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Tiết kiệm thời gian
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-xl font-bold font-display text-foreground">
                      {course.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">đ</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleAddToCart(course)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;