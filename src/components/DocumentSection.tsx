import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import type { CartItem } from "@/hooks/useOrders";
import { toast } from "sonner";

interface DocumentSectionProps {
  onAddToCart: (item: CartItem) => void;
}

const PRICE_PER_COURSE = 70000;

const documentPackages = [
  {
    id: 'semester1',
    name: 'Kỳ 1',
    courses: ['SSL101', 'CEA201', 'CSI106', 'PRF192', 'MAE101'],
  },
  {
    id: 'semester2',
    name: 'Kỳ 2',
    courses: ['NWC204', 'OSG202', 'MAD101', 'WED201', 'PRO192'],
  },
  {
    id: 'semester3',
    name: 'Kỳ 3',
    courses: ['LAB211', 'JPD113', 'DBI202', 'CSD201', 'MAS291'],
  },
];

const DocumentSection = ({ onAddToCart }: DocumentSectionProps) => {
  const handleAddToCart = (pkg: typeof documentPackages[0]) => {
    const semesterPrice = pkg.courses.length * PRICE_PER_COURSE;
    onAddToCart({
      id: pkg.id,
      name: `Tài liệu ${pkg.name} (${pkg.courses.length} môn)`,
      price: semesterPrice,
      type: 'document',
    });
    toast.success(`Đã thêm tài liệu ${pkg.name} (${semesterPrice.toLocaleString('vi-VN')}đ) vào giỏ hàng!`);
  };

  return (
    <section id="documents" className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Tài liệu ôn thi
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Bộ tài liệu ôn thi chất lượng cao cho từng kỳ học
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {documentPackages.map((pkg) => (
            <Card 
              key={pkg.id}
              className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-6 text-primary">{pkg.name}</h3>
              
              <div className="space-y-3 mb-6">
                {pkg.courses.map((course, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    <span className="font-medium">{course}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full bg-gradient-success"
                onClick={() => handleAddToCart(pkg)}
              >
                Mua cả kỳ - {(pkg.courses.length * PRICE_PER_COURSE).toLocaleString('vi-VN')}đ
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                ({pkg.courses.length} môn × {PRICE_PER_COURSE.toLocaleString('vi-VN')}đ)
              </p>
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
