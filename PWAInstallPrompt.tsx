import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-6 md:max-w-sm">
      <div className="rounded-2xl border border-emerald-200 bg-white shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <Download className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">Instalar StaffGo</h3>
            <p className="mt-1 text-sm text-slate-600">
              Adicione o StaffGo à tela inicial para abrir como app no celular.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={install}>
                Instalar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsVisible(false)}>
                Agora não
              </Button>
            </div>
          </div>
          <button
            aria-label="Fechar"
            className="text-slate-400 hover:text-slate-700"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
