"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PROFILE_KEY, PROFILE_CHANGED_EVENT, exportProfile, saveHardwareProfile, validateImport } from "@/features/profile/local-store";
import { useHardwareProfile } from "@/features/profile/use-hardware-profile";
import { Button } from "@/components/ui/button";

type AccountSession = {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export default function ProfilePage() {
  const { profile, isDemo } = useHardwareProfile();
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [authState, setAuthState] = useState<"loading" | "disabled" | "signed-out" | "signed-in">("loading");
  const [sessionMessage, setSessionMessage] = useState("");
  const loadSessions = async () => {
    try {
      const response = await fetch("/api/auth/list-sessions", { credentials: "include", cache: "no-store" });
      if (response.status === 503) { setAuthState("disabled"); return; }
      if (response.status === 401) { setAuthState("signed-out"); return; }
      if (!response.ok) throw new Error("Não foi possível consultar as sessões.");
      const value: unknown = await response.json();
      const rows = Array.isArray(value) ? value : [];
      setSessions(rows.filter((item): item is AccountSession => Boolean(item && typeof item === "object" && typeof (item as AccountSession).id === "string" && typeof (item as AccountSession).token === "string")));
      setAuthState("signed-in");
    } catch { setAuthState("disabled"); }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadSessions(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const revokeSession = async (token: string) => {
    setSessionMessage("");
    try {
      const response = await fetch("/api/auth/revoke-session", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      if (!response.ok) throw new Error("Não foi possível revogar a sessão.");
      setSessions(current => current.filter(session => session.token !== token));
      setSessionMessage("Sessão revogada.");
    } catch (error) { setSessionMessage(error instanceof Error ? error.message : "Não foi possível revogar a sessão."); }
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(exportProfile(isDemo ? null : JSON.stringify(profile)), null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob); anchor.download = "838-perfil.json"; anchor.click(); URL.revokeObjectURL(anchor.href);
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!validateImport(parsed)) throw new Error("Arquivo de perfil inválido.");
      if (parsed.hardware) saveHardwareProfile(parsed.hardware);
      else { localStorage.removeItem(PROFILE_KEY); window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)); }
      setMessage("Perfil importado.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível importar o perfil."); }
  };
  return <main><div className="page-container"><div className="page-heading"><div><p className="eyebrow">Perfil</p><h1 className="page-title">Seus dados e configurações</h1><p className="page-description">Seu hardware e suas preferências ficam neste navegador.</p></div><Button asChild variant="secondary"><Link href="/onboarding">Editar hardware</Link></Button></div><div className="grid gap-5 md:grid-cols-2"><article className="panel p-6"><h2 className="panel-title">Perfil local</h2><p className="mt-3 text-sm text-muted">{isDemo ? "Nenhum perfil válido salvo. As análises usam uma máquina de demonstração." : `${profile.cpu} · ${profile.gpu} · ${profile.ramGb} GB RAM`}</p>{!isDemo && <p className="mt-3 text-sm text-muted">{profile.objectives.join(" · ")}</p>}<div className="mt-5 flex flex-wrap gap-3"><Button onClick={download}>Exportar JSON</Button><label className="relative inline-flex h-11 cursor-pointer items-center rounded-xl border border-white/10 px-5 text-sm focus-within:outline-2 focus-within:outline-accent">Importar JSON<input aria-label="Importar JSON" type="file" accept="application/json" className="absolute inset-0 w-full cursor-pointer opacity-0" onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ""; }} /></label></div><p className="mt-3 text-xs text-muted" role="status">{message}</p></article><article className="panel p-6"><h2 className="panel-title">Conta 838</h2><p className="mt-3 text-sm leading-6 text-muted">A sincronização de perfis entre dispositivos ainda não está disponível. Você pode exportar seu perfil para manter uma cópia ou importar em outro navegador.</p><span className="badge mt-5">Sincronização indisponível</span></article></div><section className="panel mt-5 p-6" aria-labelledby="sessions-title"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="sessions-title" className="panel-title">Sessões ativas</h2><p className="mt-2 text-sm text-muted">Revogue acessos individuais quando a autenticação estiver ativada.</p></div><span className="badge">{authState === "signed-in" ? `${sessions.length} ativa${sessions.length === 1 ? "" : "s"}` : authState === "disabled" ? "Autenticação desligada" : authState === "signed-out" ? "Faça login" : "Consultando..."}</span></div>{authState === "signed-in" && <div className="mt-5 grid gap-3">{sessions.map(session => <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-4"><div className="text-sm"><p>{session.userAgent || "Navegador não identificado"}</p><p className="mt-1 text-xs text-muted">Criada em {new Date(session.createdAt).toLocaleString("pt-BR")} · expira em {new Date(session.expiresAt).toLocaleString("pt-BR")}</p></div><Button variant="secondary" onClick={() => { void revokeSession(session.token); }}>Revogar</Button></div>)}{sessions.length === 0 && <p className="text-sm text-muted">Nenhuma sessão encontrada.</p>}</div>}{authState === "disabled" && <p className="mt-4 text-sm text-muted">Este recurso permanece parado até configurar banco, HTTPS, e-mail e AUTH_ENABLED=true.</p>}{authState === "signed-out" && <p className="mt-4 text-sm text-muted">Nenhuma sessão autenticada foi encontrada neste navegador.</p>}<p className="mt-3 text-xs text-muted" role="status">{sessionMessage}</p></section></div></main>;
}
