import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, ShoppingCart, Loader2 } from "lucide-react";
import type { CartItem } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

interface DocumentSectionProps {
  onAddToCart: (item: CartItem) => void;
}

const PRICE_PER_COURSE = 70000;

const DocumentSection = ({ onAddToCart }: DocumentSectionProps) => {
  const { products: documents, isLoading } = useProducts('document');

  // Group documents by semester
  const documentsBySemester = documents.reduce((acc, doc) => {
    const semester = doc.semester || 'Khác';
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  // Sort semesters: "Kỳ 1", "Kỳ 2", etc., then "Khác" at the end
  const sortedSemesters = Object.keys(documentsBySemester).sort((a, b) => {
    if (a === 'Khác') return 1;
    if (b === 'Khác') return -1;
    return a.localeCompare(b, 'vi');
  });

  const handleAddToCart = (doc: typeof documents[0]) => {
    onAddToCart({
      id: `doc-${doc.code}`,
      code: doc.code,
      name: `Tài liệu ${doc.code} - ${doc.name.replace('Tài liệu ôn thi ', '')}`,
      price: doc.price,
      type: 'document',
    });
    toast.success(`Đã thêm tài liệu ${doc.code} vào giỏ hàng!`);
  };

  if (isLoading) {
    return (
      <section id="documents" className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (documents.length === 0) {
    return null;
  }

  // Get price from first document or fallback
  const pricePerCourse = documents[0]?.price || PRICE_PER_COURSE;

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
          {sortedSemesters.map((semester) => (
            <Card 
              key={semester}
              className="p-6 hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">{semester}</h3>
              
              <div className="space-y-2">
                {documentsBySemester[semester].map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <BookOpen className="h-4 w-4 text-secondary flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-sm">{doc.code}</span>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.description || doc.name.replace('Tài liệu ôn thi ', '')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-shrink-0 h-8 px-2"
                      onClick={() => handleAddToCart(doc)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {doc.price.toLocaleString('vi-VN')}đ
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
