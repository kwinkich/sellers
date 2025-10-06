import { create } from "zustand";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react";
import type { FC } from "react";

type AlertType = "success" | "error" | "info";

interface AppAlert {
  id: number;
  type: AlertType;
  title: string;
  description?: string;
  leaving?: boolean;
}

interface AlertStore {
  queue: AppAlert[];
  push: (a: Omit<AppAlert, "id">) => void;
  remove: (id: number, instant?: boolean) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  queue: [],
  push: (a) => {
    const id = Date.now();
    set((s) => ({ queue: [...s.queue, { id, ...a }] }));
    // Auto-hide after 5 seconds with smooth transition
    setTimeout(() => {
      set((s) => ({ queue: s.queue.map((x) => (x.id === id ? { ...x, leaving: true } : x)) }));
      setTimeout(() => {
        set((s) => ({ queue: s.queue.filter((x) => x.id !== id) }));
      }, 300);
    }, 5000);
  },
  remove: (id, instant = false) =>
    set((s) => {
      if (instant) return { queue: s.queue.filter((x) => x.id !== id) };
      // mark leaving then remove after transition
      setTimeout(() => {
        set((s2) => ({ queue: s2.queue.filter((x) => x.id !== id) }));
      }, 300);
      return { queue: s.queue.map((x) => (x.id === id ? { ...x, leaving: true } : x)) };
    }),
}));

export const AlertsHost: FC = () => {
  const { queue, remove } = useAlertStore();
  return (
    <div className="fixed inset-x-0 top-2 z-50 mx-auto flex w-full max-w-xl flex-col gap-2 px-4">
      {queue.map((a) => (
        <Alert
          key={a.id}
          variant={a.type === "error" ? "destructive" : a.type === "success" ? "success" : "info"}
          className={
            "transition-all duration-300 " + (a.leaving ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0")
          }
        >
          <div className="flex items-center gap-3">
            {a.type === "error" ? (
              <AlertCircleIcon size={16}/>
            ) : a.type === "success" ? (
              <CheckCircle2Icon size={16}/>
            ) : (
              <InfoIcon size={16}/>
            )}
            <div className="flex-1">
              <AlertTitle>{a.title}</AlertTitle>
              {a.description && <AlertDescription>{a.description}</AlertDescription>}
            </div>
            <button className="text-md" onClick={() => remove(a.id)}>×</button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

// Helper to map API errors to human-friendly alerts
export function showApiError(err: any) {
  const message = err?.error?.message || err?.message || "Произошла ошибка";
  useAlertStore.getState().push({ type: "error", title: message });
}

export function showSuccess(title: string, description?: string) {
  useAlertStore.getState().push({ type: "success", title, description });
}

export function showInfo(title: string, description?: string) {
  useAlertStore.getState().push({ type: "info", title, description });
}


