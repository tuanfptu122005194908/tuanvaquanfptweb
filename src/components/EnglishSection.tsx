import { Button } from "@/components/ui/button";
import { Check, Sparkles, Video, BookOpen } from "lucide-react";
import type { CartItem } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

interface EnglishSectionProps {
  onAddToCart: (item: CartItem) => void;
}

const EnglishSection = ({ onAddToCart }: EnglishSectionProps) => {
  const { products: services, isLoading } = useProducts('english');

  const handleAddToCart = (service: typeof services[0]) => {
    onAddToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      type: 'service',
    });
    toast.success(`Đã thêm ${service.name} vào giỏ hàng!`);
  };

  if (isLoading) {
    return (
      <section id="english" className="section-padding bg-muted/30 relative overflow-hidden">
        <div className="container-tight">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display gradient-text-accent mb-4">
              Dịch vụ tiếng Anh
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  const getIcon = (code: string) => {
    return code === 'LUK' ? Video : BookOpen;
  };

  return (
    <section id="english" className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="container-tight relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-accent/20 mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Hỗ trợ tiếng Anh</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display gradient-text-accent mb-4">
            Dịch vụ tiếng Anh
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Hỗ trợ toàn diện cho các môn Tiếng Anh tại FPT University
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => {
            const ServiceIcon = getIcon(service.code);
            
            return (
              <div 
                key={service.id}
                className="group relative glass rounded-3xl overflow-hidden hover-lift animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Image Header */}
                <div className="relative h-56 overflow-hidden">
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-card flex items-center justify-center">
                      <ServiceIcon className="h-20 w-20 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-gradient-accent text-primary-foreground text-sm font-bold shadow-elegant">
                    {service.code === 'LUK' ? '🎬 Project' : '📖 Learning'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <ServiceIcon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold font-display text-foreground">{service.name}</h3>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {service.services?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 group/item">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-success" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover/item:text-foreground transition-colors">
                          {item}
                        </span>
                      </div>
                    ))}
                    {service.description && !service.services?.length && (
                      <p className="text-muted-foreground">{service.description}</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div>
                      <span className="text-3xl font-bold font-display gradient-text-accent">
                        {service.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-muted-foreground ml-1">đ</span>
                    </div>
                    <Button 
                      className="bg-gradient-accent hover:opacity-90 text-primary-foreground px-6 shadow-elegant"
                      onClick={() => handleAddToCart(service)}
                    >
                      Đăng ký ngay
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EnglishSection;