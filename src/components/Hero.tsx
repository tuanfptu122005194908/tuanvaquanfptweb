import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";
import heroBannerAnime from "@/assets/hero-banner-anime.png";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBannerAnime})` }}
      />
      
      {/* Multi-layer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Animated glow orbs */}
      <div 
        className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow"
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-[100px] animate-pulse-glow"
        style={{ animationDelay: '1.5s' }}
      />
      <div 
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-[80px] animate-float"
      />

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 opacity-20">
        <Star className="h-8 w-8 text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-40 left-1/4 opacity-20">
        <Zap className="h-6 w-6 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container-tight py-24 md:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 mb-8 animate-slide-up"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground/90">Nền tảng học tập số 1 cho sinh viên FPT</span>
          </div>

          {/* Heading with staggered animation */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground mb-6 leading-[1.1] tracking-tight">
            <span className="block animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
              Nâng cao kiến thức,
            </span>
            <span 
              className="block gradient-text animate-slide-up opacity-0 glow-text"
              style={{ animationDelay: '0.2s' }}
            >
              Vững bước tương lai
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed animate-slide-up opacity-0"
            style={{ animationDelay: '0.3s' }}
          >
            Khóa học chất lượng cao với giá cả phải chăng dành riêng cho sinh viên FPT University
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 animate-slide-up opacity-0"
            style={{ animationDelay: '0.4s' }}
          >
            <Button 
              size="lg" 
              className="group bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-elegant hover:shadow-glow text-lg px-8 py-6 rounded-xl text-primary-foreground font-semibold"
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Khám phá ngay
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl font-semibold border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Liên hệ tư vấn
            </Button>
          </div>

          {/* Stats */}
          <div 
            className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-border/30 animate-slide-up opacity-0"
            style={{ animationDelay: '0.5s' }}
          >
            <div>
              <div className="text-3xl font-bold font-display gradient-text">500+</div>
              <div className="text-sm text-muted-foreground">Sinh viên tin dùng</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display gradient-text">15+</div>
              <div className="text-sm text-muted-foreground">Khóa học đa dạng</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display gradient-text">98%</div>
              <div className="text-sm text-muted-foreground">Đánh giá hài lòng</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;