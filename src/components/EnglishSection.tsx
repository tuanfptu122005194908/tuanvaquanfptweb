import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import type { CartItem } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";
import englishLukAnime from "@/assets/english-luk-anime.png";
import englishTransAnime from "@/assets/english-trans-anime.png";

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

  const getImage = (code: string) => {
    return code === 'LUK' ? englishLukAnime : englishTransAnime;
  };

  const getBenefitText = (code: string) => {
    return code === 'LUK' 
      ? "Hoàn thành project với điểm số ấn tượng, tiết kiệm hàng chục giờ làm video" 
      : "Nắm vững kiến thức TRANS, tự tin hoàn thành mọi bài tập";
  };

  return (
    <section id="english" className="section-padding relative overflow-hidden">
      {/* Sakura background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-pink-200/20 dark:bg-pink-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-pink-300/15 dark:bg-pink-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-pink-100/20 dark:bg-pink-400/5 blur-2xl" />
      </div>

      <div className="container-tight relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            Dịch vụ Tiếng Anh
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground mb-4">
            Không còn lo lắng về môn <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">Tiếng Anh</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Từ hỗ trợ project đến học tập, chúng tôi giúp bạn vượt qua mọi thử thách tiếng Anh tại FPT.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={service.id}
              className="group relative bg-card rounded-3xl border border-pink-200/50 dark:border-pink-800/30 overflow-hidden hover:shadow-xl hover:shadow-pink-200/20 dark:hover:shadow-pink-900/20 transition-all duration-500 animate-slide-up opacity-0"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Sakura gradient top bar */}
              <div className="h-1.5 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600" />
              
              {/* Anime character image */}
              <div className="relative flex justify-center pt-6 pb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-pink-200/30 to-transparent dark:from-pink-800/20 rounded-full blur-2xl scale-110" />
                  <img 
                    src={getImage(service.code)} 
                    alt={service.name}
                    className="relative w-36 h-36 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-2">
                <h3 className="text-xl font-bold font-display text-foreground mb-2 text-center">{service.name}</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">{getBenefitText(service.code)}</p>

                {/* Features */}
                <div className="space-y-2.5 mb-6">
                  {service.services?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center">
                        <Check className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                      </div>
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                  {service.description && !service.services?.length && (
                    <p className="text-muted-foreground">{service.description}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-pink-200/30 dark:border-pink-800/20">
                  <div>
                    <span className="text-2xl font-bold font-display text-foreground">
                      {service.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-muted-foreground ml-1">đ</span>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white gap-2 rounded-xl shadow-lg shadow-pink-500/20"
                    onClick={() => handleAddToCart(service)}
                  >
                    Đăng ký
                    <ArrowRight className="h-4 w-4" />
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

export default EnglishSection;
