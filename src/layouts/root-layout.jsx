import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LifeOSDataProvider } from "@/lib/lifeos-store";
import AppErrorBoundary from "@/components/app-error-boundary";

export default function RootLayout() {
  return (
    <LifeOSDataProvider>
      <AppErrorBoundary>
        <div className="min-h-screen">
          <Outlet />
          <Toaster />
        </div>
      </AppErrorBoundary>
    </LifeOSDataProvider>
  );
}
