import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Gift, Sparkles, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const PRIZES = [
  { value: 10000, label: "10K", color: "#FF6B6B", lightColor: "#FFE0E0" },
  { value: 20000, label: "20K", color: "#4ECDC4", lightColor: "#D4F5F2" },
  { value: 30000, label: "30K", color: "#FFE66D", lightColor: "#FFF8D4" },
  { value: 40000, label: "40K", color: "#A78BFA", lightColor: "#EDE9FE" },
  { value: 50000, label: "50K", color: "#F472B6", lightColor: "#FCE7F3" },
  { value: 10000, label: "10K", color: "#FB923C", lightColor: "#FED7AA" },
  { value: 20000, label: "20K", color: "#34D399", lightColor: "#D1FAE5" },
  { value: 30000, label: "30K", color: "#60A5FA", lightColor: "#DBEAFE" },
];

const SpinWheel = () => {
  const { user } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [approvedRequest, setApprovedRequest] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState<number | null>(null);
  const [wonCoupon, setWonCoupon] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const segmentAngle = 360 / PRIZES.length;

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    // Draw segments
    PRIZES.forEach((prize, i) => {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Inner lighter stripe
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius * 0.85, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.lightColor + "40";
      ctx.fill();

      // Segment border
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      const textRadius = radius * 0.65;
      const textX = center + Math.cos(textAngle) * textRadius;
      const textY = center + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${size * 0.055}px 'Inter', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 4;
      ctx.fillText(prize.label, 0, -6);
      ctx.font = `${size * 0.03}px 'Inter', sans-serif`;
      ctx.fillText("VNĐ", 0, 12);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.18, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius * 0.18);
    gradient.addColorStop(0, "#FFD700");
    gradient.addColorStop(1, "#FFA500");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text
    ctx.fillStyle = "#FFF";
    ctx.font = `bold ${size * 0.04}px 'Inter', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 3;
    ctx.fillText("QUAY", center, center);
  }, []);

  // Check for pending/approved requests
  useEffect(() => {
    if (!user) return;
    checkSpinStatus();

    const channel = supabase
      .channel("spin-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "spin_requests",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === "approved") {
            setApprovedRequest(updated);
            setPendingRequest(null);
            toast.success("🎉 Admin đã duyệt! Bạn có thể quay ngay!");
          } else if (updated.status === "denied") {
            setPendingRequest(null);
            toast.error("Yêu cầu quay đã bị từ chối.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const checkSpinStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("spin_requests")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      if (data[0].status === "pending") setPendingRequest(data[0]);
      if (data[0].status === "approved") setApprovedRequest(data[0]);
    }
  };

  const requestSpin = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để quay thưởng!");
      return;
    }
    setIsRequesting(true);
    try {
      const { data, error } = await supabase
        .from("spin_requests")
        .insert({ user_id: user.id, status: "pending" })
        .select()
        .single();

      if (error) throw error;
      setPendingRequest(data);
      toast.success("Đã gửi yêu cầu! Chờ Admin duyệt nhé 🎯");
    } catch (err) {
      console.error(err);
      toast.error("Không thể gửi yêu cầu!");
    } finally {
      setIsRequesting(false);
    }
  };

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "SPIN";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const doSpin = async () => {
    if (!approvedRequest || isSpinning) return;

    setIsSpinning(true);
    // Random prize
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[prizeIndex];
    // Calculate rotation: multiple full spins + land on prize segment
    const targetAngle = 360 - prizeIndex * segmentAngle - segmentAngle / 2;
    const totalRotation = rotation + 360 * 8 + targetAngle;
    setRotation(totalRotation);

    // Wait for spin animation
    setTimeout(async () => {
      const couponCode = generateCouponCode();
      setWonPrize(prize.value);
      setWonCoupon(couponCode);

      try {
        // Create the coupon
        await supabase.from("coupons").insert({
          code: couponCode,
          discount_type: "fixed",
          discount_value: prize.value,
          min_order_value: 0,
          max_uses: 1,
          active: true,
        });

        // Mark spin as completed
        await supabase
          .from("spin_requests")
          .update({
            status: "completed",
            prize_value: prize.value,
            coupon_code: couponCode,
            completed_at: new Date().toISOString(),
          })
          .eq("id", approvedRequest.id);

        setApprovedRequest(null);
        setShowResult(true);
      } catch (err) {
        console.error(err);
        toast.error("Có lỗi xảy ra!");
      }
      setIsSpinning(false);
    }, 5500);
  };

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white border-0 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 mr-1" />
            SỰ KIỆN ĐẶC BIỆT
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            🎰 Vòng Quay May Mắn
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Quay ngay để nhận mã giảm giá lên đến <strong className="text-foreground">50.000₫</strong>!
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 max-w-lg mx-auto">
          {/* Wheel */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 rounded-full opacity-20 blur-xl animate-pulse" />
            
            {/* Decorative dots around wheel */}
            <div className="absolute -inset-3 rounded-full">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    background: i % 2 === 0 ? "#FFD700" : "#FF6B6B",
                    top: `${50 + 49 * Math.sin((i * 15 * Math.PI) / 180)}%`,
                    left: `${50 + 49 * Math.cos((i * 15 * Math.PI) / 180)}%`,
                    transform: "translate(-50%, -50%)",
                    animation: `pulse ${1 + (i % 3) * 0.5}s infinite`,
                  }}
                />
              ))}
            </div>

            {/* Pointer/Arrow */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-lg" />
            </div>

            {/* Wheel canvas */}
            <div
              className="relative z-10"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "none",
              }}
            >
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="w-72 h-72 md:w-80 md:h-80 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Action area */}
          <Card className="w-full border-0 bg-gradient-to-br from-card to-muted/50 shadow-xl">
            <CardContent className="p-6 text-center space-y-4">
              {!user ? (
                <div>
                  <p className="text-muted-foreground mb-3">Đăng nhập để tham gia quay thưởng!</p>
                  <Button disabled className="w-full" size="lg">
                    <Gift className="mr-2 h-5 w-5" />
                    Đăng nhập để quay
                  </Button>
                </div>
              ) : pendingRequest ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-500">
                    <Clock className="h-5 w-5 animate-pulse" />
                    <span className="font-semibold">Đang chờ Admin duyệt...</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Yêu cầu của bạn đã được gửi. Vui lòng chờ Admin phê duyệt để quay thưởng!
                  </p>
                  <div className="flex justify-center">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : approvedRequest ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Đã được duyệt!</span>
                  </div>
                  <Button
                    onClick={doSpin}
                    disabled={isSpinning}
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-lg h-14 shadow-lg shadow-pink-500/25 transition-all hover:shadow-pink-500/40 hover:scale-[1.02]"
                  >
                    {isSpinning ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang quay...
                      </>
                    ) : (
                      <>
                        <Gift className="mr-2 h-5 w-5" />
                        🎯 QUAY NGAY!
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={requestSpin}
                  disabled={isRequesting}
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90 text-white font-bold text-base h-12 shadow-lg"
                >
                  {isRequesting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Gift className="mr-2 h-5 w-5" />
                  )}
                  Yêu cầu quay thưởng
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md text-center border-0 bg-gradient-to-br from-card via-card to-muted/50">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">🎉 Chúc mừng!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-6xl">🏆</div>
            <p className="text-lg text-muted-foreground">Bạn đã trúng thưởng</p>
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
              {wonPrize?.toLocaleString("vi-VN")}₫
            </div>
            <div className="p-4 bg-muted/80 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Mã giảm giá của bạn</p>
              <p className="text-2xl font-mono font-bold text-foreground tracking-wider">
                {wonCoupon}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Sử dụng mã này khi đặt hàng để được giảm giá!
            </p>
            <Button onClick={() => setShowResult(false)} className="w-full">
              Tuyệt vời! 🎊
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SpinWheel;
