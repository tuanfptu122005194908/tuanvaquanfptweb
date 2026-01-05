import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, Loader2, FileText, ExternalLink } from "lucide-react";
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
      <section id="documents" className="section-padding bg-background relative overflow-hidden">
        <div className="container-tight flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary" />
        </div>
      </section>
    );
  }

  if (documents.length === 0) {
    return null;
  }

  const pricePerCourse = documents[0]?.price || PRICE_PER_COURSE;

  return (
    <section id="documents" className="section-padding bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-glow opacity-10" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />

      <div className="container-tight relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-secondary/20 mb-6">
            <FileText className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">Tài liệu học tập</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            <span className="gradient-text">Tài liệu ôn thi</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-4">
            Bộ tài liệu ôn thi chất lượng cao được tổng hợp kỹ lưỡng
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="text-lg font-bold text-secondary">
              {pricePerCourse.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-muted-foreground">/ môn học</span>
          </div>
        </div>

        {/* Semester Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {sortedSemesters.map((semester, sIndex) => (
            <div 
              key={semester}
              className="card-premium animate-slide-up opacity-0"
              style={{ animationDelay: `${sIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-secondary/10">
                  <BookOpen className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-xl font-bold font-display text-foreground">{semester}</h3>
              </div>
              
              <div className="space-y-2">
                {documentsBySemester[semester].map((doc, dIndex) => (
                  <div 
                    key={doc.id} 
                    className="group flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors" />
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-foreground">{doc.code}</span>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.description || doc.name.replace('Tài liệu ôn thi ', '')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="flex-shrink-0 h-8 px-3 text-secondary hover:text-secondary hover:bg-secondary/10"
                      onClick={() => handleAddToCart(doc)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      {doc.price.toLocaleString('vi-VN')}đ
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
            className="border-secondary/30 hover:border-secondary hover:bg-secondary/10 text-secondary"
            onClick={() => window.open('https://docs.google.com/document/d/1THKvW20D4o-bPxCyrillclf1R5Z_29Os5EpOX6G--dw/edit?tab=t.0', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Xem demo tài liệu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DocumentSection;