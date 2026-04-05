import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Users, Briefcase, Building2, BarChart3, Shield, Bell, Settings, Trash2,
  RefreshCw, Send, FileText, Globe, LogOut, Home,
  TrendingUp, Activity, CheckCircle, XCircle, Search
} from "lucide-react";
import { toast } from "sonner";

type AdminTab = "overview" | "jobs" | "users" | "companies" | "external" | "telemetry" | "audit" | "automation" | "notifications";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  if (loading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-600 mb-4">Esta área é exclusiva para administradores.</p>
          <Button onClick={() => navigate("/")} className="bg-emerald-600 hover:bg-emerald-700 text-white">Voltar ao Início</Button>
        </Card>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: "overview", label: "Visão Geral", icon: BarChart3 },
    { id: "jobs", label: "Vagas", icon: Briefcase },
    { id: "users", label: "Usuários", icon: Users },
    { id: "companies", label: "Empresas", icon: Building2 },
    { id: "external", label: "Vagas Externas", icon: Globe },
    { id: "telemetry", label: "Telemetria", icon: TrendingUp },
    { id: "audit", label: "Auditoria", icon: FileText },
    { id: "automation", label: "Automações", icon: Settings },
    { id: "notifications", label: "Notificações", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen sticky top-0">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-lg">StaffGo Admin</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{user.name || user.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.id ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700 space-y-2">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
            <Home className="w-4 h-4" /> Ir ao Site
          </button>
          <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "jobs" && <JobsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "companies" && <CompaniesTab />}
        {activeTab === "external" && <ExternalJobsTab />}
        {activeTab === "telemetry" && <TelemetryTab />}
        {activeTab === "audit" && <AuditTab />}
        {activeTab === "automation" && <AutomationTab />}
        {activeTab === "notifications" && <AdminNotificationsTab />}
      </main>
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();
  if (isLoading) return <LoadingSpinner />;

  const cards = [
    { label: "Usuários", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-500" },
    { label: "Candidatos", value: stats?.totalCandidates ?? 0, icon: Users, color: "bg-emerald-500" },
    { label: "Empresas", value: stats?.totalCompanies ?? 0, icon: Building2, color: "bg-purple-500" },
    { label: "Vagas Internas", value: stats?.totalJobs ?? 0, icon: Briefcase, color: "bg-orange-500" },
    { label: "Vagas Ativas", value: stats?.totalActiveJobs ?? 0, icon: CheckCircle, color: "bg-green-500" },
    { label: "Candidaturas", value: stats?.totalApplications ?? 0, icon: FileText, color: "bg-indigo-500" },
    { label: "Vagas Externas", value: stats?.totalExternalJobs ?? 0, icon: Globe, color: "bg-teal-500" },
    { label: "Matches IA", value: stats?.totalMatches ?? 0, icon: TrendingUp, color: "bg-pink-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Visão Geral da Plataforma</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color} text-white`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-600" /> Resumo para Patrocinadores</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>A plataforma StaffGo conecta <strong>{stats?.totalCandidates ?? 0} candidatos</strong> a <strong>{stats?.totalActiveJobs ?? 0} vagas ativas</strong> de <strong>{stats?.totalCompanies ?? 0} empresas</strong> cadastradas.</p>
            <p>Além disso, agregamos <strong>{stats?.totalExternalJobs ?? 0} vagas externas</strong> de plataformas como LinkedIn, OLX, Indeed e Catho.</p>
            <p>O motor de IA já realizou <strong>{stats?.totalMatches ?? 0} matches</strong> inteligentes.</p>
            <p>Total de <strong>{stats?.totalApplications ?? 0} candidaturas</strong> processadas.</p>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" /> Indicadores de Performance</h3>
          <div className="space-y-4">
            <MetricBar label="Taxa de Preenchimento" value={stats?.totalActiveJobs ? Math.round((stats.totalApplications / stats.totalActiveJobs) * 100) : 0} max={100} color="bg-emerald-500" />
            <MetricBar label="Engajamento de Candidatos" value={stats?.totalCandidates ? Math.round((stats.totalApplications / Math.max(stats.totalCandidates, 1)) * 100) : 0} max={100} color="bg-blue-500" />
            <MetricBar label="Vagas com Candidaturas" value={stats?.totalApplications ?? 0} max={Math.max(stats?.totalJobs ?? 1, 1)} color="bg-purple-500" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─── Jobs Tab ─── */
function JobsTab() {
  const { data: allJobs, isLoading, refetch } = trpc.admin.getAllJobs.useQuery({ limit: 200 });
  const deleteJob = trpc.admin.deleteJob.useMutation({ onSuccess: () => { refetch(); toast.success("Vaga excluída"); } });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!allJobs) return [];
    if (!search) return allJobs;
    const s = search.toLowerCase();
    return allJobs.filter((j: any) => j.title?.toLowerCase().includes(s) || j.city?.toLowerCase().includes(s));
  }, [allJobs, search]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Vagas</h1>
        <span className="text-sm text-slate-500">{filtered.length} vagas</span>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar por título ou cidade..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" />
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Vaga</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Cidade</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Setor</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Views</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job: any) => (
              <tr key={job.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{job.title}</td>
                <td className="px-4 py-3 text-slate-600">{job.city}/{job.state}</td>
                <td className="px-4 py-3"><SectorBadge sector={job.sector} /></td>
                <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                <td className="px-4 py-3 text-slate-600">{job.viewCount ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => { if (confirm("Excluir esta vaga?")) deleteJob.mutate({ jobId: job.id }); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-slate-500">Nenhuma vaga encontrada</p>}
      </div>
    </div>
  );
}

/* ─── Users Tab ─── */
function UsersTab() {
  const { data: allUsers, isLoading, refetch } = trpc.admin.getAllUsers.useQuery({ limit: 100 });
  const deleteUser = trpc.admin.deleteUser.useMutation({ onSuccess: () => { refetch(); toast.success("Usuário excluído"); } });
  const sendNotif = trpc.admin.sendNotification.useMutation({ onSuccess: () => toast.success("Notificação enviada") });
  const [notifModal, setNotifModal] = useState<{ userId: number; name: string } | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Gestão de Usuários</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Cadastro</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {allUsers?.map((u: any) => (
              <tr key={u.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{u.email || "—"}</td>
                <td className="px-4 py-3"><TypeBadge type={u.userType} /></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-right flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-700"
                    onClick={() => { setNotifModal({ userId: u.id, name: u.name || u.email || "Usuário" }); setNotifTitle(""); setNotifMsg(""); }}>
                    <Send className="w-4 h-4" />
                  </Button>
                  {u.role !== 'admin' && (
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700"
                      onClick={() => { if (confirm(`Excluir ${u.name || "este usuário"}?`)) deleteUser.mutate({ userId: u.id }); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notifModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setNotifModal(null)}>
          <Card className="p-6 w-full max-w-md mx-4 bg-white" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Enviar Notificação para {notifModal.name}</h3>
            <input type="text" placeholder="Título da notificação" value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-3 text-sm" />
            <textarea placeholder="Mensagem..." value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 text-sm h-24 resize-none" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNotifModal(null)}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => { sendNotif.mutate({ userId: notifModal.userId, title: notifTitle, message: notifMsg }); setNotifModal(null); }}
                disabled={!notifTitle || !notifMsg}>
                <Send className="w-4 h-4 mr-1" /> Enviar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── Companies Tab ─── */
function CompaniesTab() {
  const { data: allCompanies, isLoading, refetch } = trpc.admin.getAllCompanies.useQuery({ limit: 100 });
  const verifyCompany = trpc.admin.verifyCompany.useMutation({ onSuccess: () => { refetch(); toast.success("Status atualizado"); } });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Gestão de Empresas</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">CNPJ</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Setor</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Cidade</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Verificada</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {allCompanies?.map((c: any) => (
              <tr key={c.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{c.companyName}</td>
                <td className="px-4 py-3 text-slate-600">{c.cnpj || "—"}</td>
                <td className="px-4 py-3"><SectorBadge sector={c.sector} /></td>
                <td className="px-4 py-3 text-slate-600">{c.city}/{c.state}</td>
                <td className="px-4 py-3">
                  {c.verified ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-slate-300" />}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => verifyCompany.mutate({ companyId: c.id, verified: !c.verified })}>
                    {c.verified ? "Revogar" : "Verificar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!allCompanies || allCompanies.length === 0) && <p className="text-center py-8 text-slate-500">Nenhuma empresa cadastrada</p>}
      </div>
    </div>
  );
}

/* ─── External Jobs Tab ─── */
function ExternalJobsTab() {
  const { data: extJobs, isLoading, refetch } = trpc.admin.getExternalJobs.useQuery({ limit: 100 });
  const fetchJobs = trpc.admin.fetchExternalJobs.useMutation({
    onSuccess: (data) => {
      refetch();
      const sectors = data.bySector ? Object.entries(data.bySector).map(([s, c]) => `${s}: ${c}`).join(", ") : "";
      toast.success(`${data.totalImported} vagas importadas! (${sectors})`);
    },
    onError: () => toast.error("Erro ao importar vagas"),
  });
  const dailyUpdate = trpc.admin.runDailyUpdate.useMutation({
    onSuccess: (data) => {
      refetch();
      const imported = data.imported;
      toast.success(`Atualização diária concluída! ${imported.totalImported} vagas importadas de ${imported.linkedInCompanies} empresas LinkedIn`);
    },
    onError: () => toast.error("Erro na atualização diária"),
  });
  const deleteExtJob = trpc.admin.deleteExternalJob.useMutation({ onSuccess: () => { refetch(); toast.success("Vaga externa removida"); } });
  const cleanup = trpc.admin.cleanupExternalJobs.useMutation({ onSuccess: () => { refetch(); toast.success("Vagas antigas removidas"); } });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Vagas Externas Agregadas</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => cleanup.mutate()} disabled={cleanup.isPending}>
            <Trash2 className="w-4 h-4 mr-1" /> Limpar Antigas
          </Button>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => fetchJobs.mutate()} disabled={fetchJobs.isPending}>
            <RefreshCw className={`w-4 h-4 mr-1 ${fetchJobs.isPending ? "animate-spin" : ""}`} />
            {fetchJobs.isPending ? "Importando..." : "Importar Vagas"}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => dailyUpdate.mutate()} disabled={dailyUpdate.isPending}>
            <RefreshCw className={`w-4 h-4 mr-1 ${dailyUpdate.isPending ? "animate-spin" : ""}`} />
            {dailyUpdate.isPending ? "Atualizando..." : "Atualização Diária LinkedIn"}
          </Button>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-800">Integração LinkedIn + IA</span>
        </div>
        <p className="text-sm text-blue-700">Vagas agregadas automaticamente do LinkedIn e outras fontes usando IA. O sistema busca empresas reais dos setores de hotelaria, construção, varejo e supermercados, e gera vagas operacionais realistas. Use "Atualização Diária" para executar o ciclo completo (limpar antigas + importar novas).</p>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Vaga</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Fonte</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Cidade</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Setor</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {extJobs?.map((job: any) => (
              <tr key={job.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{job.title}</td>
                <td className="px-4 py-3 text-slate-600">{job.company || "—"}</td>
                <td className="px-4 py-3"><SourceBadge source={job.source} /></td>
                <td className="px-4 py-3 text-slate-600">{job.city}/{job.state}</td>
                <td className="px-4 py-3"><SectorBadge sector={job.sector} /></td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700"
                    onClick={() => deleteExtJob.mutate({ id: job.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!extJobs || extJobs.length === 0) && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">Nenhuma vaga externa importada</p>
            <p className="text-sm text-slate-400">Clique em "Importar Vagas" para buscar oportunidades</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Telemetry Tab ─── */
function TelemetryTab() {
  const thirtyDaysAgo = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0]; }, []);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const { data: stats, isLoading } = trpc.admin.getTelemetryStats.useQuery({ startDate: thirtyDaysAgo, endDate: today });

  const eventLabels: Record<string, string> = {
    job_view: "Visualizações de Vagas", job_click: "Cliques em Vagas", job_apply: "Candidaturas",
    job_share: "Compartilhamentos", profile_view: "Visualizações de Perfil", search: "Buscas",
    login: "Logins", signup: "Cadastros", external_job_click: "Cliques em Vagas Externas",
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Telemetria da Plataforma</h1>
      <p className="text-sm text-slate-500 mb-6">Métricas dos últimos 30 dias — use para apresentar a patrocinadores e clientes.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats?.map((s: any) => (
          <Card key={s.eventType} className="p-4">
            <p className="text-xs text-slate-500 mb-1">{eventLabels[s.eventType] || s.eventType}</p>
            <p className="text-3xl font-bold text-slate-900">{s.total}</p>
          </Card>
        ))}
        {(!stats || stats.length === 0) && (
          <Card className="p-6 col-span-full text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Nenhum evento registrado ainda. Os dados aparecerão conforme os usuários interagem.</p>
          </Card>
        )}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Dados para Relatório de Patrocinadores</h3>
        <p className="text-sm text-slate-600">Este painel registra automaticamente todas as interações dos usuários. Use estes dados para demonstrar o engajamento e o valor da plataforma para potenciais patrocinadores e investidores.</p>
      </Card>
    </div>
  );
}

/* ─── Audit Tab ─── */
function AuditTab() {
  const { data: logs, isLoading } = trpc.admin.getAuditLogs.useQuery({ limit: 100 });
  const actionLabels: Record<string, string> = {
    job_created: "Vaga criada", job_updated: "Vaga atualizada", job_deleted: "Vaga excluída",
    job_paused: "Vaga pausada", job_closed: "Vaga encerrada", user_created: "Usuário criado",
    user_updated: "Usuário atualizado", user_deleted: "Usuário excluído", user_banned: "Usuário banido",
    company_verified: "Empresa verificada", company_unverified: "Verificação revogada",
    application_submitted: "Candidatura enviada", application_status_changed: "Status candidatura alterado",
    notification_sent: "Notificação enviada", settings_changed: "Configuração alterada",
    external_job_imported: "Vagas externas importadas", external_job_removed: "Vaga externa removida",
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Auditoria do Sistema</h1>
      <p className="text-sm text-slate-500 mb-6">Registro completo de todas as ações realizadas na plataforma.</p>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Data/Hora</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Ação</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Usuário ID</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Alvo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log: any) => (
              <tr key={log.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{actionLabels[log.action] || log.action}</td>
                <td className="px-4 py-3 text-slate-600">{log.userId || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{log.targetType ? `${log.targetType} #${log.targetId}` : "—"}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{log.details || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!logs || logs.length === 0) && <p className="text-center py-8 text-slate-500">Nenhum registro de auditoria</p>}
      </div>
    </div>
  );
}

/* ─── Automation Tab ─── */
function AutomationTab() {
  const { data: settings, isLoading, refetch } = trpc.admin.getAutomationSettings.useQuery();
  const updateSetting = trpc.admin.updateAutomationSetting.useMutation({ onSuccess: () => { refetch(); toast.success("Configuração salva"); } });

  const defaultSettings = [
    { key: "notify_on_job_view", description: "Notificar empresa quando vaga é visualizada", category: "notifications" as const, defaultValue: "true" },
    { key: "notify_on_profile_view", description: "Notificar candidato quando perfil é acessado", category: "notifications" as const, defaultValue: "true" },
    { key: "notify_on_new_match", description: "Notificar sobre novos matches compatíveis", category: "notifications" as const, defaultValue: "true" },
    { key: "notify_on_application", description: "Notificar empresa sobre novas candidaturas", category: "notifications" as const, defaultValue: "true" },
    { key: "auto_fetch_external_jobs", description: "Buscar vagas externas automaticamente", category: "scraping" as const, defaultValue: "true" },
    { key: "external_jobs_fetch_interval", description: "Intervalo de busca de vagas externas (horas)", category: "scraping" as const, defaultValue: "24" },
    { key: "auto_cleanup_old_jobs", description: "Remover vagas externas antigas automaticamente", category: "scraping" as const, defaultValue: "true" },
    { key: "cleanup_days_threshold", description: "Dias para considerar vaga externa antiga", category: "scraping" as const, defaultValue: "7" },
    { key: "matching_min_score", description: "Score mínimo para considerar match (%)", category: "matching" as const, defaultValue: "30" },
    { key: "matching_auto_notify", description: "Notificar automaticamente sobre matches acima do score mínimo", category: "matching" as const, defaultValue: "true" },
  ];

  if (isLoading) return <LoadingSpinner />;

  const getSettingValue = (key: string, defaultVal: string) => {
    const found = settings?.find((s: any) => s.settingKey === key);
    return found?.settingValue ?? defaultVal;
  };

  const categories = [
    { key: "notifications", label: "Notificações", icon: Bell },
    { key: "scraping", label: "Agregação de Vagas", icon: Globe },
    { key: "matching", label: "Motor de Matching", icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Automações do Sistema</h1>
      <p className="text-sm text-slate-500 mb-6">Configure os parâmetros de automação da plataforma.</p>
      {categories.map(cat => (
        <Card key={cat.key} className="p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <cat.icon className="w-5 h-5 text-emerald-600" /> {cat.label}
          </h3>
          <div className="space-y-4">
            {defaultSettings.filter(s => s.category === cat.key).map(setting => {
              const currentValue = getSettingValue(setting.key, setting.defaultValue);
              const isBool = setting.defaultValue === "true" || setting.defaultValue === "false";
              return (
                <div key={setting.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{setting.description}</p>
                    <p className="text-xs text-slate-400">{setting.key}</p>
                  </div>
                  {isBool ? (
                    <button onClick={() => updateSetting.mutate({ key: setting.key, value: currentValue === "true" ? "false" : "true", description: setting.description, category: setting.category })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${currentValue === "true" ? "bg-emerald-500" : "bg-slate-300"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${currentValue === "true" ? "left-6" : "left-0.5"}`} />
                    </button>
                  ) : (
                    <input type="text" value={currentValue}
                      onChange={e => updateSetting.mutate({ key: setting.key, value: e.target.value, description: setting.description, category: setting.category })}
                      className="w-20 px-2 py-1 border rounded text-sm text-center" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ─── Admin Notifications Tab ─── */
function AdminNotificationsTab() {
  const sendNotif = trpc.admin.sendNotification.useMutation({ onSuccess: () => toast.success("Notificação enviada!") });
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Enviar Notificações</h1>
      <Card className="p-6 max-w-lg">
        <h3 className="font-semibold text-slate-900 mb-4">Nova Notificação</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">ID do Usuário</label>
            <input type="number" value={userId} onChange={e => setUserId(e.target.value)} placeholder="Ex: 1"
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Título</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da notificação"
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Mensagem</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Mensagem detalhada..."
              className="w-full px-3 py-2 border rounded-lg text-sm h-24 resize-none" />
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => { sendNotif.mutate({ userId: Number(userId), title, message }); setUserId(""); setTitle(""); setMessage(""); }}
            disabled={!userId || !title || !message || sendNotif.isPending}>
            <Send className="w-4 h-4 mr-2" /> Enviar Notificação
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Helper Components ─── */
function LoadingSpinner() {
  return <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 animate-spin text-emerald-600" /></div>;
}

function SectorBadge({ sector }: { sector: string }) {
  const labels: Record<string, string> = { hospitality: "Hotelaria", construction: "Construção", retail: "Varejo", supermarket: "Supermercado", other: "Outros" };
  const colors: Record<string, string> = { hospitality: "bg-blue-100 text-blue-700", construction: "bg-orange-100 text-orange-700", retail: "bg-purple-100 text-purple-700", supermarket: "bg-green-100 text-green-700", other: "bg-slate-100 text-slate-700" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[sector] || colors.other}`}>{labels[sector] || sector}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { active: "bg-green-100 text-green-700", paused: "bg-yellow-100 text-yellow-700", closed: "bg-red-100 text-red-700" };
  const labels: Record<string, string> = { active: "Ativa", paused: "Pausada", closed: "Encerrada" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-700"}`}>{labels[status] || status}</span>;
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = { candidate: "bg-emerald-100 text-emerald-700", company: "bg-blue-100 text-blue-700", admin: "bg-red-100 text-red-700" };
  const labels: Record<string, string> = { candidate: "Candidato", company: "Empresa", admin: "Admin" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type] || "bg-slate-100 text-slate-700"}`}>{labels[type] || type}</span>;
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = { linkedin: "bg-blue-100 text-blue-700", olx: "bg-orange-100 text-orange-700", facebook: "bg-indigo-100 text-indigo-700", indeed: "bg-purple-100 text-purple-700", catho: "bg-teal-100 text-teal-700", infojobs: "bg-pink-100 text-pink-700", other: "bg-slate-100 text-slate-700" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[source] || colors.other}`}>{source}</span>;
}
