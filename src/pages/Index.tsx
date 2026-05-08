import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAvatar from "@/assets/logo-avatar.png";

const NEW_SITE_URL = "https://tqmaster.vercel.app/";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pink-50 to-rose-100 dark:from-background dark:via-pink-950/20 dark:to-rose-950/20 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <div className="bg-card border border-border rounded-3xl shadow-2xl p-8 md:p-12 text-center space-y-6 animate-slide-up">
          <div className="flex justify-center">
            <img src={logoAvatar} alt="Logo" className="h-20 w-20 rounded-full ring-4 ring-primary/20" />
          </div>

          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold font-display text-foreground">
              Website đã ngừng hoạt động
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Cảm ơn quý khách đã đồng hành cùng <strong className="text-foreground">Tuấn & Quân</strong> trong suốt thời gian qua. 💖
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Chúng tôi đã chuyển sang website mới với nhiều tính năng tốt hơn. Mong quý khách tiếp tục ủng hộ!
            </p>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Website mới của chúng tôi</p>
            <a
              href={NEW_SITE_URL}
              className="text-primary font-bold text-lg hover:underline break-all"
            >
              tqmaster.vercel.app
            </a>
          </div>

          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-xl font-semibold shadow-lg"
            onClick={() => (window.location.href = NEW_SITE_URL)}
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Truy cập website mới ngay
          </Button>

          <p className="text-xs text-muted-foreground pt-2">
            Mọi thắc mắc vui lòng liên hệ qua website mới để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
