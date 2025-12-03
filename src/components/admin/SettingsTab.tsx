import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save, CreditCard } from "lucide-react";
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
      // Update payment QR URL
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cài đặt trang web</h2>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Thông tin thanh toán</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Mã QR Thanh toán</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Ảnh QR code sẽ hiển thị khi khách hàng thanh toán đơn hàng.
            </p>
            <ImageUpload
              value={settings.payment_qr_url || ""}
              onChange={(url) =>
                setSettings({ ...settings, payment_qr_url: url })
              }
              onUpload={uploadImage}
              isUploading={isUploading}
              placeholder="Tải QR"
            />
          </div>

          {settings.payment_qr_url && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Xem trước:</p>
              <img
                src={settings.payment_qr_url}
                alt="Payment QR"
                className="max-w-xs rounded-lg border"
              />
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Lưu cài đặt
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsTab;
