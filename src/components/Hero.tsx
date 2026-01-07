import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import heroBannerAnime from "@/assets/hero-banner-anime.png";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBannerAnime})` }}
      />
      
      {/* Clean gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 container-tight py-24 md:py-32">
        <div className="max-w-2xl space-y-8">
          {/* Social proof badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-slide-up"
          >
            <div className="flex -space-x-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                  <Star className="w-3 h-3 text-primary" />
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">Được 500+ sinh viên FPT tin dùng</span>
          </div>

          {/* Main heading - benefit-focused */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display text-foreground leading-[1.1] animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
              Đạt điểm 8-9+ môn học
              <span className="block text-primary mt-2">chỉ sau 2-3 tuần ôn tập</span>
            </h1>
            
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed animate-slide-up opacity-0"
              style={{ animationDelay: '0.2s' }}
            >
              Tài liệu được tổng hợp bởi những sinh viên đã đạt điểm cao. Không lý thuyết dài dòng, chỉ những gì bạn cần để đậu môn.
            </p>
          </div>

          {/* Benefits list */}
          <div 
            className="space-y-3 animate-slide-up opacity-0"
            style={{ animationDelay: '0.3s' }}
          >
            {[
              "Tài liệu cập nhật theo đề thi mới nhất",
              "Tiết kiệm 80% thời gian ôn tập",
              "Hỗ trợ giải đáp thắc mắc 24/7"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up opacity-0"
            style={{ animationDelay: '0.4s' }}
          >
            <Button 
              size="lg" 
              className="group bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Xem khóa học ngay
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl font-semibold border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Tư vấn miễn phí
            </Button>
          </div>

          {/* Trust indicators */}
          <div 
            className="flex flex-wrap gap-8 pt-8 border-t border-border animate-slide-up opacity-0"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="text-center">
              <div className="text-3xl font-extrabold font-display text-primary">98%</div>
              <div className="text-sm text-muted-foreground mt-1">Tỷ lệ hài lòng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold font-display text-primary">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Sinh viên đã dùng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold font-display text-primary">15+</div>
              <div className="text-sm text-muted-foreground mt-1">Môn học hỗ trợ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;