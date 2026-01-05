import { Button } from "@/components/ui/button";
import { Facebook, Mail, MessageCircle, ArrowUpRight } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="section-padding bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-glow opacity-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
      
      <div className="container-tight relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Header */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 mb-6">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Liên hệ</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground mb-4">
            Kết nối với <span className="gradient-text">chúng tôi</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
            Hãy liên hệ để được tư vấn và hỗ trợ tốt nhất về các dịch vụ học tập
          </p>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Facebook */}
            <button
              onClick={() => window.open('https://www.facebook.com/tuanvaquan', '_blank')}
              className="group card-premium flex items-center gap-4 text-left hover:border-secondary/50"
            >
              <div className="p-4 rounded-2xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Facebook className="h-8 w-8 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Facebook</p>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  Tuấn và Quân
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-secondary" />
                </p>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={() => window.location.href = 'mailto:lequan12305@gmail.com'}
              className="group card-premium flex items-center gap-4 text-left hover:border-accent/50"
            >
              <div className="p-4 rounded-2xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Mail className="h-8 w-8 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  lequan12305@gmail.com
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                </p>
              </div>
            </button>
          </div>

          {/* Footer note */}
          <p className="text-sm text-muted-foreground mt-12">
            © 2024 Tuấn & Quân. Được thiết kế với ❤️ cho sinh viên FPT
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;