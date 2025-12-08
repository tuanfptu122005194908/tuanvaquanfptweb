import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save, CreditCard, QrCode, Settings, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "./ImageUpload";

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
}

const SettingsTab = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { uploadImage, isUploading } = useImageUpload({
    bucket: "site-assets",
    folder: "payment",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      (data as SiteSetting[]).forEach((item) => {
        settingsMap[item.key] = item.value || "";
      });
      setSettings(settingsMap);
    } catch (error: any) {
      toast.error("Không thể tải cài đặt: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { key: "payment_qr_url", value: settings.payment_qr_url || "" },
          { onConflict: "key" }
        );

      if (error) throw error;
      toast.success("Đã lưu cài đặt!");
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-primary rounded-xl shadow-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Cài đặt hệ thống</h2>
          <p className="text-muted-foreground">Quản lý các cài đặt của website</p>
        </div>
      </div>

      {/* Payment Settings Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Thông tin thanh toán</h3>
              <p className="text-sm text-muted-foreground">Cài đặt phương thức thanh toán</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-5 w-5 text-primary" />
                <Label className="text-sm font-medium">Mã QR Thanh toán</Label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Ảnh QR code sẽ hiển thị khi khách hàng thanh toán đơn hàng.
              </p>
              <ImageUpload
                value={settings.payment_qr_url || ""}
                onChange={(url) => setSettings({ ...settings, payment_qr_url: url })}
                onUpload={uploadImage}
                isUploading={isUploading}
                placeholder="Tải QR"
              />
            </div>

            {settings.payment_qr_url && (
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-600">Xem trước QR Code</p>
                </div>
                <div className="flex justify-center">
                  <img
                    src={settings.payment_qr_url}
                    alt="Payment QR"
                    className="max-w-[200px] rounded-xl border-2 border-slate-200 shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-gradient-primary hover:opacity-90 px-8"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lưu cài đặt
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsTab;
