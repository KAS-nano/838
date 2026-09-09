"use client";

import Link from "next/link";
import { useState } from "react";
import { PROFILE_KEY, PROFILE_CHANGED_EVENT, exportProfile, saveHardwareProfile, validateImport } from "@/features/profile/local-store";
import { useHardwareProfile } from "@/features/profile/use-hardware-profile";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { profile, isDemo } = useHardwareProfile();
  const [message, setMessage] = useState("");
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
  return <main><div className="page-container"><div className="page-heading"><div><p className="eyebrow">Perfil</p><h1 className="page-title">Seus dados e configurações</h1><p className="page-description">Seu hardware e suas preferências ficam neste navegador.</p></div><Button asChild variant="secondary"><Link href="/onboarding">Editar hardware</Link></Button></div><div className="grid gap-5 md:grid-cols-2"><article className="panel p-6"><h2 className="panel-title">Perfil local</h2><p className="mt-3 text-sm text-muted">{isDemo ? "Nenhum perfil válido salvo. As análises usam uma máquina de demonstração." : `${profile.cpu} · ${profile.gpu} · ${profile.ramGb} GB RAM`}</p>{!isDemo && <p className="mt-3 text-sm text-muted">{profile.objectives.join(" · ")}</p>}<div className="mt-5 flex flex-wrap gap-3"><Button onClick={download}>Exportar JSON</Button><label className="relative inline-flex h-11 cursor-pointer items-center rounded-xl border border-white/10 px-5 text-sm focus-within:outline-2 focus-within:outline-accent">Importar JSON<input aria-label="Importar JSON" type="file" accept="application/json" className="absolute inset-0 w-full cursor-pointer opacity-0" onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ""; }} /></label></div><p className="mt-3 text-xs text-muted" role="status">{message}</p></article><article className="panel p-6"><h2 className="panel-title">Conta 838</h2><p className="mt-3 text-sm leading-6 text-muted">A sincronização de perfis entre dispositivos ainda não está disponível. Você pode exportar seu perfil para manter uma cópia ou importar em outro navegador.</p><span className="badge mt-5">Sincronização indisponível</span></article></div></div></main>;
}
