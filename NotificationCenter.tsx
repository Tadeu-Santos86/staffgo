import { useState } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data: notifications, refetch } = trpc.notification.list.useQuery({ limit: 20 });
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery();
  const markRead = trpc.notification.markRead.useMutation({ onSuccess: () => refetch() });
  const markAllRead = trpc.notification.markAllRead.useMutation({ onSuccess: () => refetch() });

  const count = typeof unreadCount === "number" ? unreadCount : 0;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
        <Bell className="w-5 h-5 text-slate-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 w-80 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="font-semibold text-slate-900 text-sm">Notificações</span>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button onClick={() => markAllRead.mutate()} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" /> Ler todas
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-72">
              {notifications && notifications.length > 0 ? (
                notifications.map((n: any) => (
                  <div key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? "bg-emerald-50/50" : ""}`}
                    onClick={() => { if (!n.read) markRead.mutate({ notificationId: n.id }); }}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? "bg-emerald-500" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Nenhuma notificação</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
