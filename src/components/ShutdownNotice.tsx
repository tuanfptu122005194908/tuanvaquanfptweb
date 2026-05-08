import { useEffect, useState } from "react";
import { AlertCircle, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NEW_SITE_URL = "https://tqmaster.vercel.app/";

const ShutdownNotice = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Sticky top banner */}
      <div className="sticky top-0 z-[60] w-full bg-gradient-to-r from-primary via-pink-500 to-rose-500 text-white shadow-md">
        <div className="container-tight flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-2 px-4 text-center text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Trang web này đã ngừng hoạt động. Vui lòng chuyển sang website mới của chúng tôi!</span>
          </div>
          <a
            href={NEW_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-white text-primary font-bold px-3 py-1 rounded-full hover:bg-white/90 transition-colors"
          >
            Truy cập ngay <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Modal popup */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <AlertCircle className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-display">
              Thông báo ngừng hoạt động
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Cảm ơn quý khách đã đồng hành cùng chúng tôi! 💖
              <br />
              Website này sẽ <strong className="text-foreground">ngừng hoạt động</strong>. Mong quý khách vui lòng chuyển sang sử dụng website mới của chúng tôi để tiếp tục được hỗ trợ tốt nhất.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 border border-border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Website mới:</p>
            <a
              href={NEW_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline break-all"
            >
              tqmaster.vercel.app
            </a>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => window.open(NEW_SITE_URL, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Chuyển sang website mới
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="w-full text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Đóng và xem trang cũ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShutdownNotice;
