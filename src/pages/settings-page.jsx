import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/auth";
import { useLifeOSData } from "@/lib/lifeos-store";
import { useState } from "react";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export default function SettingsPage() {
  const { data, actions } = useLifeOSData();
  const { toast } = useToast();
  const languages = data.content.settings.languages;
  const [isResetting, setIsResetting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const saveSettings = () => {
    toast({
      title: "Sozlamalar saqlandi",
      description: "Tanlangan parametrlar muvaffaqiyatli yangilandi.",
    });
  };

  const handleResetState = async () => {
    setIsResetting(true);
    const nextState = await actions.resetState();
    setIsResetting(false);

    if (!nextState) {
      toast({
        variant: "destructive",
        title: "Reset xatosi",
        description: "Holatni tiklashda xatolik yuz berdi.",
      });
      return;
    }

    toast({
      title: "State reset qilindi",
      description: "Barcha ma'lumotlar backend default holatiga qaytarildi.",
    });
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsUploading(true);
    const payload = await actions.uploadImage(file);
    setIsUploading(false);

    if (!payload?.url) {
      toast({
        variant: "destructive",
        title: "Upload xatosi",
        description: "Rasmni yuklash muvaffaqiyatsiz tugadi.",
      });
      return;
    }

    const resolvedUrl = payload.url.startsWith("http")
      ? payload.url
      : `${API_ORIGIN}${payload.url}`;
    setUploadedImageUrl(resolvedUrl);
    toast({
      title: "Rasm yuklandi",
      description: "Fayl backendga muvaffaqiyatli yuborildi.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Til tanlash</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => actions.setLanguage(item)}
              className={
                data.settings.language === item
                  ? "rounded-full bg-slate-900 px-4 py-1.5 text-sm text-white"
                  : "rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:border-slate-900"
              }
            >
              {item}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bildirishnomalar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            onClick={() => actions.toggleNotification("habits")}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left"
          >
            <span>
              <p className="font-medium">Odat eslatmalari</p>
              <p className="text-sm text-slate-500">Har kuni odat check-in uchun xabar</p>
            </span>
            <Badge variant={data.settings.notifications.habits ? "default" : "outline"}>
              {data.settings.notifications.habits ? "On" : "Off"}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => actions.toggleNotification("goals")}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left"
          >
            <span>
              <p className="font-medium">Maqsad progress xabari</p>
              <p className="text-sm text-slate-500">Haftalik holat haqida bildirishnoma</p>
            </span>
            <Badge variant={data.settings.notifications.goals ? "default" : "outline"}>
              {data.settings.notifications.goals ? "On" : "Off"}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => actions.toggleNotification("assistant")}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left"
          >
            <span>
              <p className="font-medium">AI maslahat xabarlari</p>
              <p className="text-sm text-slate-500">Kunlik tavsiya va eslatmalar</p>
            </span>
            <Badge variant={data.settings.notifications.assistant ? "default" : "outline"}>
              {data.settings.notifications.assistant ? "On" : "Off"}
            </Badge>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integratsiyalar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            onClick={() => actions.toggleIntegration("calendar")}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left"
          >
            <span>
              <p className="font-medium">Taqvim integratsiyasi</p>
              <p className="text-sm text-slate-500">Google/Apple calendar bilan sinxronlash</p>
            </span>
            <Badge variant={data.settings.integrations.calendar ? "default" : "outline"}>
              {data.settings.integrations.calendar ? "On" : "Off"}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => actions.toggleIntegration("smartwatch")}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left"
          >
            <span>
              <p className="font-medium">Smart soat</p>
              <p className="text-sm text-slate-500">Sog'liq ko'rsatkichlarini olish</p>
            </span>
            <Badge variant={data.settings.integrations.smartwatch ? "default" : "outline"}>
              {data.settings.integrations.smartwatch ? "On" : "Off"}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => actions.toggleIntegration("mobileSync")}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left"
          >
            <span>
              <p className="font-medium">Mobil integratsiya</p>
              <p className="text-sm text-slate-500">Ilova ma'lumotlarini telefonga uzatish</p>
            </span>
            <Badge variant={data.settings.integrations.mobileSync ? "default" : "outline"}>
              {data.settings.integrations.mobileSync ? "On" : "Off"}
            </Badge>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backend aksiyalar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">State reset endpoint</p>
            <Button
              variant="outline"
              onClick={handleResetState}
              disabled={isResetting}
            >
              {isResetting ? "Reset qilinmoqda..." : "State reset"}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-500">Rasm yuklash endpoint</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              disabled={isUploading}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            {isUploading ? <p className="text-xs text-slate-500">Yuklanmoqda...</p> : null}
            {uploadedImageUrl ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">{uploadedImageUrl}</p>
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded preview"
                  className="h-24 rounded-md border border-slate-300 object-cover"
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings}>Saqlash</Button>
    </div>
  );
}
