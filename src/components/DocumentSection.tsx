import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, Loader2, FileText, ExternalLink, CheckCircle2 } from "lucide-react";
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

  // Sort semesters
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
      <section id="documents" className="section-padding bg-background">
        <div className="container-tight flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (documents.length === 0) {
    return null;
  }

  const pricePerCourse = documents[0]?.price || PRICE_PER_COURSE;

  return (
    <section id="documents" className="section-padding bg-background">
      <div className="container-tight">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-3">Tài liệu ôn thi</p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground mb-4">
            Ôn tập đúng trọng tâm, đậu môn không lo
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Tài liệu được tổng hợp từ các kỳ thi thực tế, giúp bạn biết chính xác những gì cần học.
          </p>
          
          {/* Benefits */}
          <div className="flex flex-wrap gap-4 mb-6">
            {["Cập nhật đề thi mới nhất", "Tóm tắt trọng tâm", "Có đáp án chi tiết"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>

          {/* Price tag */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-lg font-bold text-primary">
              {pricePerCourse.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-muted-foreground">/ môn</span>
          </div>
        </div>

        {/* Semester Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {sortedSemesters.map((semester, sIndex) => (
            <div 
              key={semester}
              className="bg-card rounded-2xl border border-border p-6 animate-slide-up opacity-0"
              style={{ animationDelay: `${sIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-display text-foreground">{semester}</h3>
              </div>
              
              <div className="space-y-1">
                {documentsBySemester[semester].map((doc) => (
                  <div 
                    key={doc.id} 
                    className="group flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-foreground">{doc.code}</span>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.description || doc.name.replace('Tài liệu ôn thi ', '')}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="flex-shrink-0 h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => handleAddToCart(doc)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Demo Link */}
        <div className="text-center">
          <Button 
            variant="outline"
            size="lg"
            className="border-2 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => window.open('https://docs.google.com/document/d/1THKvW20D4o-bPxCyrillclf1R5Z_29Os5EpOX6G--dw/edit?tab=t.0', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Xem demo tài liệu miễn phí
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DocumentSection;