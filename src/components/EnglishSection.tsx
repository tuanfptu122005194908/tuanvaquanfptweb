import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
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
      <section id="english" className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Dịch vụ Tiếng Anh
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <section id="english" className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Dịch vụ Tiếng Anh
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Hỗ trợ toàn diện cho các môn Tiếng Anh tại FPT
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service) => (
            <Card 
              key={service.id}
              className="min-h-[38rem] flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Image Background - 50% */}
              <div 
                className="h-1/2 bg-cover bg-center relative bg-muted"
                style={service.image_url ? { backgroundImage: `url(${service.image_url})` } : undefined}
              >
                {!service.image_url && (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    🎬
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              </div>

              {/* Content - 50% */}
              <div className="h-1/2 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{service.code === 'LUK' ? '🎬' : '📖'}</span>
                  <h3 className="text-2xl font-bold text-primary">{service.name}</h3>
                </div>

                <div className="space-y-2 mb-6 flex-grow">
                  {service.services?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                  {service.description && !service.services?.length && (
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <span className="text-2xl font-bold text-primary">
                    {service.price.toLocaleString('vi-VN')}đ
                  </span>
                  <Button 
                    className="bg-gradient-accent"
                    onClick={() => handleAddToCart(service)}
                  >
                    Đăng ký
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

export default EnglishSection;
