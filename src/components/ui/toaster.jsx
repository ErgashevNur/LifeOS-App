import { Toaster as SonnerToaster } from "sonner";
import "sonner/dist/styles.css";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4500}
      toastOptions={{
        style: {
          border: "1px solid rgb(203 213 225)",
          background: "white",
          color: "rgb(15 23 42)",
        },
      }}
    />
  );
}
