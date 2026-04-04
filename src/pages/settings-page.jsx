import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/auth";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Globe, Bell, Smartphone, Watch, Calendar, UploadCloud, RotateCcw, Settings, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
          <Settings className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sozlamalar</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Platforma boshqaruvi</p>
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-xl font-extrabold tracking-tight">Til va mintaqa</CardTitle>
          </div>
          <p className="text-sm font-medium text-slate-500">Ilova interfeysi uchun tilni tanlang</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 flex flex-wrap gap-3">
          {languages.map((item) => {
            const isActive = data.settings.language === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => actions.setLanguage(item)}
                className={cn(
                  "rounded-full px-6 py-2.5 text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 ring-1 ring-inset ring-slate-200 shadow-sm"
                )}
              >
                {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                {item}
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-xl font-extrabold tracking-tight">Bildirishnomalar</CardTitle>
          </div>
          <p className="text-sm font-medium text-slate-500">Ilova bildirishnomalarini sozlash</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-3">
          <button
            type="button"
            onClick={() => actions.toggleNotification("habits")}
            className={cn(
              "flex w-full items-center justify-between rounded-[1.5rem] border-0 p-5 text-left transition-all shadow-sm ring-1 group",
              data.settings.notifications.habits ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-slate-100 hover:bg-white hover:ring-slate-200 hover:shadow-md"
            )}
          >
            <span>
              <p className={cn("font-bold text-lg transition-colors", data.settings.notifications.habits ? "text-amber-900" : "text-slate-900")}>Odat eslatmalari</p>
              <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", data.settings.notifications.habits ? "text-amber-500/80" : "text-slate-400")}>Har kuni odat check-in uchun xabar</p>
            </span>
            <div className={cn(
               "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
               data.settings.notifications.habits ? "bg-amber-500" : "bg-slate-300"
            )}>
               <div className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out absolute text-[0px]",
                  data.settings.notifications.habits ? "translate-x-6" : "translate-x-0"
               )}>Toggle</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => actions.toggleNotification("goals")}
            className={cn(
              "flex w-full items-center justify-between rounded-[1.5rem] border-0 p-5 text-left transition-all shadow-sm ring-1 group",
              data.settings.notifications.goals ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-slate-100 hover:bg-white hover:ring-slate-200 hover:shadow-md"
            )}
          >
            <span>
              <p className={cn("font-bold text-lg transition-colors", data.settings.notifications.goals ? "text-amber-900" : "text-slate-900")}>Maqsad progress xabari</p>
              <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", data.settings.notifications.goals ? "text-amber-500/80" : "text-slate-400")}>Haftalik holat haqida bildirishnoma</p>
            </span>
            <div className={cn(
               "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
               data.settings.notifications.goals ? "bg-amber-500" : "bg-slate-300"
            )}>
               <div className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out absolute text-[0px]",
                  data.settings.notifications.goals ? "translate-x-6" : "translate-x-0"
               )}>Toggle</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => actions.toggleNotification("assistant")}
             className={cn(
              "flex w-full items-center justify-between rounded-[1.5rem] border-0 p-5 text-left transition-all shadow-sm ring-1 group",
              data.settings.notifications.assistant ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-slate-100 hover:bg-white hover:ring-slate-200 hover:shadow-md"
            )}
          >
            <span>
              <p className={cn("font-bold text-lg transition-colors", data.settings.notifications.assistant ? "text-amber-900" : "text-slate-900")}>AI maslahat xabarlari</p>
              <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", data.settings.notifications.assistant ? "text-amber-500/80" : "text-slate-400")}>Kunlik tavsiya va eslatmalar</p>
            </span>
            <div className={cn(
               "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
               data.settings.notifications.assistant ? "bg-amber-500" : "bg-slate-300"
            )}>
               <div className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out absolute text-[0px]",
                  data.settings.notifications.assistant ? "translate-x-6" : "translate-x-0"
               )}>Toggle</div>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="h-5 w-5 text-cyan-500" />
            <CardTitle className="text-xl font-extrabold tracking-tight">Integratsiyalar</CardTitle>
          </div>
          <p className="text-sm font-medium text-slate-500">Tashqi xizmatlar bilan ishlash</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-3">
          <button
            type="button"
            onClick={() => actions.toggleIntegration("calendar")}
            className={cn(
              "flex w-full items-center justify-between rounded-[1.5rem] border-0 p-5 text-left transition-all shadow-sm ring-1 group",
              data.settings.integrations.calendar ? "bg-cyan-50 ring-cyan-200" : "bg-slate-50 ring-slate-100 hover:bg-white hover:ring-slate-200 hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-xl transition-colors", data.settings.integrations.calendar ? "bg-cyan-500 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200")}>
                 <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("font-bold text-lg transition-colors", data.settings.integrations.calendar ? "text-cyan-900" : "text-slate-900")}>Taqvim integratsiyasi</p>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", data.settings.integrations.calendar ? "text-cyan-600/80" : "text-slate-400")}>Google/Apple calendar sinxronlash</p>
              </div>
            </div>
            <div className={cn(
               "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
               data.settings.integrations.calendar ? "bg-cyan-500" : "bg-slate-300"
            )}>
               <div className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out absolute text-[0px]",
                  data.settings.integrations.calendar ? "translate-x-6" : "translate-x-0"
               )}>Toggle</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => actions.toggleIntegration("smartwatch")}
            className={cn(
              "flex w-full items-center justify-between rounded-[1.5rem] border-0 p-5 text-left transition-all shadow-sm ring-1 group",
              data.settings.integrations.smartwatch ? "bg-cyan-50 ring-cyan-200" : "bg-slate-50 ring-slate-100 hover:bg-white hover:ring-slate-200 hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-xl transition-colors", data.settings.integrations.smartwatch ? "bg-cyan-500 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200")}>
                 <Watch className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("font-bold text-lg transition-colors", data.settings.integrations.smartwatch ? "text-cyan-900" : "text-slate-900")}>Smart soat</p>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", data.settings.integrations.smartwatch ? "text-cyan-600/80" : "text-slate-400")}>Sog'liq ko'rsatkichlarini olish</p>
              </div>
            </div>
             <div className={cn(
               "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
               data.settings.integrations.smartwatch ? "bg-cyan-500" : "bg-slate-300"
            )}>
               <div className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out absolute text-[0px]",
                  data.settings.integrations.smartwatch ? "translate-x-6" : "translate-x-0"
               )}>Toggle</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => actions.toggleIntegration("mobileSync")}
            className={cn(
              "flex w-full items-center justify-between rounded-[1.5rem] border-0 p-5 text-left transition-all shadow-sm ring-1 group",
              data.settings.integrations.mobileSync ? "bg-cyan-50 ring-cyan-200" : "bg-slate-50 ring-slate-100 hover:bg-white hover:ring-slate-200 hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-xl transition-colors", data.settings.integrations.mobileSync ? "bg-cyan-500 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200")}>
                 <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("font-bold text-lg transition-colors", data.settings.integrations.mobileSync ? "text-cyan-900" : "text-slate-900")}>Mobil integratsiya</p>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", data.settings.integrations.mobileSync ? "text-cyan-600/80" : "text-slate-400")}>Ma'lumotlarni telefonga uzatish</p>
              </div>
            </div>
            <div className={cn(
               "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
               data.settings.integrations.mobileSync ? "bg-cyan-500" : "bg-slate-300"
            )}>
               <div className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out absolute text-[0px]",
                  data.settings.integrations.mobileSync ? "translate-x-6" : "translate-x-0"
               )}>Toggle</div>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-slate-50 overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-xl font-extrabold tracking-tight text-slate-900">Backend amallari</CardTitle>
          <p className="text-sm font-medium text-slate-500">Tizim holati va fayllar</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          <div className="p-6 rounded-[1.5rem] bg-white ring-1 ring-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 mb-1">State Reset</p>
              <p className="text-xs text-slate-500">Barcha ma'lumotlarni backend defaultiga qaytaradi.</p>
            </div>
            <Button
              variant="destructive"
              onClick={handleResetState}
              disabled={isResetting}
              className="rounded-xl h-12 px-6 font-bold w-full sm:w-auto"
            >
              <RotateCcw className={cn("w-4 h-4 mr-2", isResetting && "animate-spin")} />
              {isResetting ? "Reset qilinmoqda..." : "State reset"}
            </Button>
          </div>

          <div className="p-6 rounded-[1.5rem] bg-white ring-1 ring-slate-200 shadow-sm flex flex-col gap-4">
             <div>
               <p className="font-bold text-slate-900 mb-1">Rasm yuklash</p>
               <p className="text-xs text-slate-500">Fayllarni serverga yuborish test uchun</p>
             </div>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={cn(
                "w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors",
                isUploading ? "border-indigo-300 bg-indigo-50 text-indigo-500" : "border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500"
              )}>
                 <UploadCloud className={cn("w-8 h-8 mb-2", isUploading && "animate-bounce")} />
                 <p className="text-sm font-bold">{isUploading ? "Yuklanmoqda..." : "Faylni tanlang yoki shu yerga tashlang"}</p>
              </div>
            </div>
            
            {uploadedImageUrl ? (
              <div className="mt-4 space-y-3 p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 break-all">{uploadedImageUrl}</p>
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded preview"
                  className="h-32 w-auto rounded-xl border-0 shadow-sm ring-1 ring-slate-200 object-cover"
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={saveSettings}
          className="rounded-2xl h-14 px-8 font-bold text-lg bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-95 transition-transform"
        >
          O'zgarishlarni Saqlash
        </Button>
      </div>
    </div>
  );
}
