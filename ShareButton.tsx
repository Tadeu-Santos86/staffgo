import { useState } from "react";
import { Share2, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ShareButtonProps {
  jobId: number;
  jobTitle: string;
  company?: string;
  className?: string;
}

export function ShareButton({ jobId, jobTitle, company, className }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const trackShare = trpc.job.trackShare.useMutation();

  const shareUrl = `${window.location.origin}/vaga/${jobId}`;
  const shareText = company
    ? `Vaga: ${jobTitle} na ${company} - StaffGo`
    : `Vaga: ${jobTitle} - StaffGo`;

  const handleShare = (platform: string) => {
    trackShare.mutate({ jobId, platform });

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShare.mutate({ jobId, platform: "copy" });
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <div className={`relative ${className || ""}`}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}
        className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50">
        <Share2 className="w-4 h-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-56">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Compartilhar vaga</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              <ShareOption icon="💬" label="WhatsApp" onClick={() => handleShare("whatsapp")} color="hover:bg-green-50" />
              <ShareOption icon="📘" label="Facebook" onClick={() => handleShare("facebook")} color="hover:bg-blue-50" />
              <ShareOption icon="💼" label="LinkedIn" onClick={() => handleShare("linkedin")} color="hover:bg-sky-50" />
              <ShareOption icon="🐦" label="Twitter / X" onClick={() => handleShare("twitter")} color="hover:bg-slate-50" />
              <ShareOption icon="✈️" label="Telegram" onClick={() => handleShare("telegram")} color="hover:bg-cyan-50" />
              <button onClick={handleCopy}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                {copied ? "Copiado!" : "Copiar Link"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ShareOption({ icon, label, onClick, color }: { icon: string; label: string; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 ${color} transition-colors`}>
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}
