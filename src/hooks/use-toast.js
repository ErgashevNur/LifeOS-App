import { toast as sonnerToast } from "sonner";

function normalizeToastPayload(payload = {}) {
  const { title, description, variant, action } = payload;
  const message = title || description || "Xabar";

  return {
    message,
    variant,
    options: {
      description: title ? description : undefined,
      duration: payload.duration,
      id: payload.id,
      action:
        action && typeof action === "object" && action.label && action.onClick
          ? { label: action.label, onClick: action.onClick }
          : undefined,
    },
  };
}

function toast(payload = {}) {
  const { message, variant, options } = normalizeToastPayload(payload);
  const id =
    variant === "destructive"
      ? sonnerToast.error(message, options)
      : sonnerToast(message, options);

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (nextPayload = {}) => {
      const next = normalizeToastPayload({ ...payload, ...nextPayload, id });
      if (next.variant === "destructive") {
        sonnerToast.error(next.message, next.options);
      } else {
        sonnerToast(next.message, next.options);
      }
    },
  };
}

function useToast() {
  return {
    toasts: [],
    toast,
    dismiss: (toastId) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };
