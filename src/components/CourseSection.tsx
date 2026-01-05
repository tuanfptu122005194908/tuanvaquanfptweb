import { Button } from "@/components/ui/button";
import { ShoppingCart, BookOpen, GraduationCap } from "lucide-react";
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
      <section id="courses" className="section-padding bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        <div className="container-tight relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display gradient-text mb-4">
              Khóa học
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section id="courses" className="section-padding bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-glow opacity-20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-[80px]" />

      <div className="container-tight relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 mb-6">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Chương trình đào tạo</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display gradient-text mb-4">
            Khóa học chất lượng
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Được thiết kế riêng cho sinh viên FPT University với nội dung cập nhật theo chương trình học
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className="group card-premium flex flex-col h-[26rem] animate-slide-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl bg-muted">
                {course.image_url ? (
                  <img 
                    src={course.image_url} 
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-card">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full glass text-xs font-semibold text-primary">
                  {course.code}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold font-display text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {course.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div>
                    <span className="text-2xl font-bold font-display gradient-text">
                      {course.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">đ</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-elegant"
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