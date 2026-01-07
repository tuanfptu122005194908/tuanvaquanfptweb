import { Facebook, Mail, MessageCircle, ArrowUpRight } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="section-padding bg-muted/30">
      <div className="container-tight">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-3">Liên hệ</p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground mb-4">
            Cần hỗ trợ? Liên hệ ngay
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Phản hồi trong vòng 30 phút trong giờ làm việc
          </p>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* Facebook */}
            <button
              onClick={() => window.open('https://www.facebook.com/tuanvaquan', '_blank')}
              className="group bg-card rounded-xl border border-border p-5 flex items-center gap-4 text-left hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="p-3 rounded-lg bg-primary/10">
                <Facebook className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Facebook</p>
                <p className="font-semibold text-foreground text-sm flex items-center gap-1">
                  Tuấn và Quân
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={() => window.location.href = 'mailto:lequan12305@gmail.com'}
              className="group bg-card rounded-xl border border-border p-5 flex items-center gap-4 text-left hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="font-semibold text-foreground text-sm flex items-center gap-1 truncate">
                  lequan12305@gmail.com
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground mt-12">
            © 2024 Tuấn & Quân · Được xây dựng cho sinh viên FPT
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;