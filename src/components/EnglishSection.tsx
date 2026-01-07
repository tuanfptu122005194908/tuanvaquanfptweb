import { Button } from "@/components/ui/button";
import { Check, Video, BookOpen, ArrowRight } from "lucide-react";
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
      <section id="english" className="section-padding bg-muted/50">
        <div className="container-tight flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
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

  const getBenefitText = (code: string) => {
    return code === 'LUK' 
      ? "Hoàn thành project với điểm số ấn tượng, tiết kiệm hàng chục giờ làm video" 
      : "Nắm vững kiến thức TRANS, tự tin hoàn thành mọi bài tập";
  };

  return (
    <section id="english" className="section-padding bg-muted/50">
      <div className="container-tight">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-3">Dịch vụ Tiếng Anh</p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground mb-4">
            Không còn lo lắng về môn Tiếng Anh
          </h2>
          <p className="text-muted-foreground text-lg">
            Từ hỗ trợ project đến học tập, chúng tôi giúp bạn vượt qua mọi thử thách tiếng Anh tại FPT.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {services.map((service, index) => {
            const ServiceIcon = getIcon(service.code);
            
            return (
              <div 
                key={service.id}
                className="group bg-card rounded-2xl border border-border p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <ServiceIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-foreground mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{getBenefitText(service.code)}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {service.services?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
                        <Check className="h-3 w-3 text-success" />
                      </div>
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                  {service.description && !service.services?.length && (
                    <p className="text-muted-foreground">{service.description}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div>
                    <span className="text-2xl font-bold font-display text-foreground">
                      {service.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-muted-foreground ml-1">đ</span>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    onClick={() => handleAddToCart(service)}
                  >
                    Đăng ký
                    <ArrowRight className="h-4 w-4" />
                  </Button>
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