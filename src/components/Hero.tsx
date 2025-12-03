import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-banner.png";

const Hero = () => {
  return (
    <section 
      className="relative min-h-[500px] flex items-center justify-center py-24 bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl">
          Nâng cao kiến thức,<br />
          Vững bước tương lai
        </h1>
        <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto opacity-90">
          Khóa học chất lượng cao với giá cả phải chăng
        </p>
        <Button 
          size="lg" 
          className="bg-gradient-accent hover:scale-105 transition-transform shadow-elegant text-lg px-10 py-6 rounded-xl"
          onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Khám phá ngay
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default Hero;
