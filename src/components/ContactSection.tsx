import { Button } from "@/components/ui/button";
import { Facebook, Mail } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          📞 Liên hệ với chúng tôi
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Hãy kết nối để nhận tư vấn
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Button
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            onClick={() => window.open('https://www.facebook.com/tuanvaquan', '_blank')}
          >
            <Facebook className="h-5 w-5 mr-2" />
            Facebook: Tuấn và Quân
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            onClick={() => window.location.href = 'mailto:lequan12305@gmail.com'}
          >
            <Mail className="h-5 w-5 mr-2" />
            lequan12305@gmail.com
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
