import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, ShoppingCart } from "lucide-react";
import type { CartItem } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

interface DocumentSectionProps {
  onAddToCart: (item: CartItem) => void;
}

const PRICE_PER_COURSE = 70000;

// Hardcoded semester structure - can be enhanced later to come from DB
const semesterStructure = [
  {
    id: 'semester1',
    name: 'Kỳ 1',
    courses: [
      { code: 'SSL101', name: 'Academic Skills for University Success' },
      { code: 'CEA201', name: 'Computer Organization and Architecture' },
      { code: 'CSI106', name: 'Introduction to Computer Science' },
      { code: 'PRF192', name: 'Programming Fundamentals' },
      { code: 'MAE101', name: 'Mathematics for Engineering' },
    ],
  },
  {
    id: 'semester2',
    name: 'Kỳ 2',
    courses: [
      { code: 'NWC204', name: 'Computer Networking' },
      { code: 'OSG202', name: 'Operating Systems' },
      { code: 'MAD101', name: 'Discrete Mathematics' },
      { code: 'WED201', name: 'Web Design' },
      { code: 'PRO192', name: 'Object-Oriented Programming' },
    ],
  },
  {
    id: 'semester3',
    name: 'Kỳ 3',
    courses: [
      { code: 'LAB211', name: 'OOP with Java Lab' },
      { code: 'JPD113', name: 'Elementary Japanese 1-A1.1' },
      { code: 'DBI202', name: 'Database Systems' },
      { code: 'CSD201', name: 'Data Structures and Algorithms' },
      { code: 'MAS291', name: 'Statistics and Probability' },
    ],
  },
];

const DocumentSection = ({ onAddToCart }: DocumentSectionProps) => {
  const { products: documents, isLoading } = useProducts('document');

  // Get price from DB or fallback to default
  const pricePerCourse = documents.length > 0 ? documents[0].price : PRICE_PER_COURSE;

  const handleAddCourseToCart = (semesterName: string, course: { code: string; name: string }) => {
    onAddToCart({
      id: `doc-${course.code}`,
      code: course.code,
      name: `Tài liệu ${course.code} - ${course.name}`,
      price: pricePerCourse,
      type: 'document',
    });
    toast.success(`Đã thêm tài liệu ${course.code} vào giỏ hàng!`);
  };

  return (
    <section id="documents" className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Tài liệu ôn thi
        </h2>
        <p className="text-center text-muted-foreground mb-4 max-w-2xl mx-auto">
          Bộ tài liệu ôn thi chất lượng cao cho từng kỳ học
        </p>
        <p className="text-center text-primary font-semibold mb-12">
          Giá: {pricePerCourse.toLocaleString('vi-VN')}đ / môn
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {semesterStructure.map((pkg) => (
            <Card 
              key={pkg.id}
              className="p-6 hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">{pkg.name}</h3>
              
              {/* Course list with buy buttons - show all courses */}
              <div className="space-y-2">
                {pkg.courses.map((course) => (
                  <div 
                    key={course.code} 
                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <BookOpen className="h-4 w-4 text-secondary flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-sm">{course.code}</span>
                        <p className="text-xs text-muted-foreground truncate">{course.name}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-shrink-0 h-8 px-2"
                      onClick={() => handleAddCourseToCart(pkg.name, course)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {pricePerCourse.toLocaleString('vi-VN')}đ
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Demo Link */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.open('https://docs.google.com/document/d/1THKvW20D4o-bPxCyrillclf1R5Z_29Os5EpOX6G--dw/edit?tab=t.0', '_blank')}
          >
            Xem demo tài liệu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DocumentSection;
