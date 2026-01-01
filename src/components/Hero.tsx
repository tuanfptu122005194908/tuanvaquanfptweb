import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroBannerAnime from "@/assets/hero-banner-anime.png";

const Hero = () => {
  return (
    <section className="relative min-h-[500px] flex items-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBannerAnime})` }}
      />
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e]/80 via-[#1a1035]/60 to-transparent" />
      
      {/* Subtle animated glow effects */}
      <div 
        className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-[80px]"
        style={{ animation: 'float 7s ease-in-out 2s infinite' }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            <span className="text-sm text-gray-200">Nền tảng học tập số 1 cho sinh viên FPT</span>
          </div>

          {/* Heading with staggered animation */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            <span className="block animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Nâng cao kiến thức,
            </span>
            <span 
              className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              Vững bước tương lai
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            Khóa học chất lượng cao với giá cả phải chăng dành cho sinh viên
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 hover:from-pink-600 hover:via-purple-600 hover:to-orange-500 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] text-lg px-8 py-6 rounded-xl text-white font-semibold"
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Khám phá ngay
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
