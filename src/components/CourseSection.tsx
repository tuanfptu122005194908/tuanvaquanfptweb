import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
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
      <section id="courses" className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Khóa học
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section id="courses" className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Khóa học
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Khóa học chất lượng cao, phù hợp với sinh viên FPT University
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="h-[28rem] flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-300"
            >
              {/* Image - 50% height */}
              <div className="h-1/2 overflow-hidden bg-muted">
                {course.image_url ? (
                  <img 
                    src={course.image_url} 
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📚
                  </div>
                )}
              </div>

              {/* Content - 50% height */}
              <div className="h-1/2 p-4 flex flex-col">
                <h3 className="font-bold text-primary text-lg mb-1">{course.code}</h3>
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{course.name}</h4>
                <p className="text-xs text-muted-foreground mb-4 flex-grow line-clamp-3">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-primary">
                    {course.price.toLocaleString('vi-VN')}đ
                  </span>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handleAddToCart(course)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
