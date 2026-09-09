"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { readHardwareProfile, saveHardwareProfile } from "@/features/profile/local-store";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Cpu, Goal, MonitorCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initialHardwareProfile, objectives, type HardwareProfile, type Objective } from "@/features/onboarding/types";
import { hasErrors, validateGoals, validateHardware, type ValidationErrors } from "@/features/onboarding/validation";

type Step = 1 | 2 | 3;

const priorities = [
  ["quality", "Qualidade"], ["speed", "Velocidade"], ["efficiency", "Baixo consumo"],
  ["privacy", "Privacidade"], ["ease", "Facilidade"], ["cost", "Menor custo"],
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-rose-300" role="alert">{message}</p>;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [profile, setProfile] = useState<HardwareProfile>(initialHardwareProfile);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    const restore = () => { const saved = readHardwareProfile(); if (saved) { setProfile(saved); setEditing(true); } };
    restore();
  }, []);

  const progress = useMemo(() => `${Math.round((step / 3) * 100)}%`, [step]);
  const set = <K extends keyof HardwareProfile>(key: K, value: HardwareProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const next = () => {
    const nextErrors = step === 1 ? validateHardware(profile) : step === 2 ? validateGoals(profile) : {};
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    if (step < 3) setStep((step + 1) as Step);
  };

  const toggleObjective = (objective: Objective) => {
    const selected = profile.objectives.includes(objective);
    set("objectives", selected ? profile.objectives.filter((item) => item !== objective) : [...profile.objectives, objective]);
  };

  const save = () => {
    const all = { ...validateHardware(profile), ...validateGoals(profile) };
    setErrors(all);
    if (hasErrors(all)) return;
    try {
      saveHardwareProfile({ ...profile, distro: profile.os === "linux" ? profile.distro : "" });
      router.push("/dashboard");
    } catch {
      setErrors({ form: "Não foi possível salvar. Verifique se o navegador permite armazenamento local e tente novamente." });
    }
  };

  return (
    <main>
      <div className="page-container onboarding-container">
        <form noValidate onSubmit={event => { event.preventDefault(); if (step === 3) save(); else next(); }}>
          <nav className="onboarding-steps" aria-label="Etapas do perfil">{["Máquina", "Objetivo", "Revisão"].map((label, index) => <span key={label} className="onboarding-step" aria-current={step === index + 1 ? "step" : undefined}>{String(index + 1).padStart(2, "0")} / {label}</span>)}</nav>
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="eyebrow">{editing ? "Editar hardware" : "Configurar perfil"} · Etapa {step} de 3</p>
              <h1 className="page-title">
                {step === 1 ? "Conte sobre sua máquina" : step === 2 ? "O que você quer fazer?" : "Revise seu perfil"}
              </h1>
            </div>
            <span className="text-sm text-muted">{progress}</span>
          </div>
          <progress className="meter mt-5" value={step} max={3} aria-label="Progresso do perfil" />

          <section className="panel mt-8 p-5 sm:p-7">
            {step === 1 && (
              <div className="space-y-7">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["desktop", "notebook"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => set("deviceType", type)} aria-pressed={profile.deviceType === type} className={`rounded-2xl border p-4 text-left transition ${profile.deviceType === type ? "border-accent/50 bg-accent/[.07]" : "border-white/10 bg-black/10 hover:bg-white/[.04]"}`}>
                      <MonitorCog className="h-5 w-5 text-accent" aria-hidden="true" /><span className="mt-3 block font-medium">{type === "desktop" ? "PC / Desktop" : "Notebook"}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm">Processador<input aria-label="Processador" aria-invalid={Boolean(errors.cpu)} value={profile.cpu} onChange={(e) => set("cpu", e.target.value)} placeholder="Ex.: Ryzen 7 5700X" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-accent/50"/><FieldError message={errors.cpu}/></label>
                  <label className="text-sm">GPU<input aria-label="GPU" aria-invalid={Boolean(errors.gpu)} value={profile.gpu} onChange={(e) => set("gpu", e.target.value)} placeholder="Ex.: Radeon RX 9070 XT" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-accent/50"/><FieldError message={errors.gpu}/></label>
                  <label className="text-sm">VRAM (GB)<input aria-label="VRAM (GB)" aria-invalid={Boolean(errors.vramGb)} type="number" min="0" max="192" value={profile.vramGb} onChange={(e) => set("vramGb", Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-accent/50"/><FieldError message={errors.vramGb}/></label>
                  <label className="text-sm">RAM (GB)<input aria-label="RAM (GB)" aria-invalid={Boolean(errors.ramGb)} type="number" min="2" max="1024" value={profile.ramGb} onChange={(e) => set("ramGb", Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-accent/50"/><FieldError message={errors.ramGb}/></label>
                  <label className="text-sm">Armazenamento total (GB)<input aria-label="Armazenamento total (GB)" aria-invalid={Boolean(errors.storageTotalGb)} type="number" min="16" value={profile.storageTotalGb} onChange={(e) => set("storageTotalGb", Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-accent/50"/><FieldError message={errors.storageTotalGb}/></label>
                  <label className="text-sm">Espaço livre (GB)<input aria-label="Espaço livre (GB)" aria-invalid={Boolean(errors.storageFreeGb)} type="number" min="0" value={profile.storageFreeGb} onChange={(e) => set("storageFreeGb", Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-accent/50"/><FieldError message={errors.storageFreeGb}/></label>
                  <label className="text-sm">Sistema operacional<select aria-label="Sistema operacional" value={profile.os} onChange={(e) => set("os", e.target.value as HardwareProfile["os"])} className="mt-2 w-full rounded-xl border border-white/10 bg-surface-raised px-4 py-3 outline-none focus:border-accent/50"><option value="windows">Windows</option><option value="linux">Linux</option><option value="macos">macOS</option></select></label>
                  {profile.os === "linux" && <label className="text-sm">Distribuição Linux<input aria-label="Distribuição Linux" aria-invalid={Boolean(errors.distro)} value={profile.distro} onChange={(e) => set("distro", e.target.value)} placeholder="Ex.: CachyOS" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-accent/50"/><FieldError message={errors.distro}/></label>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {objectives.map((objective) => {
                    const selected = profile.objectives.includes(objective);
                    return <button type="button" key={objective} onClick={() => toggleObjective(objective)} aria-pressed={selected} className={`flex min-h-20 items-center justify-between rounded-2xl border p-4 text-left ${selected ? "border-accent/50 bg-accent/[.07]" : "border-white/10 bg-black/10 hover:bg-white/[.04]"}`}><span className="text-sm">{objective}</span>{selected && <Check className="h-4 w-4 text-accent" aria-hidden="true"/>}</button>;
                  })}
                </div>
                <FieldError message={errors.objectives}/>

                <div className="mt-8">
                  <h2 className="font-medium">Sua prioridade</h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {priorities.map(([value, label]) => <button type="button" key={value} onClick={() => set("priority", value)} aria-pressed={profile.priority === value} className={`rounded-xl border px-4 py-3 text-sm ${profile.priority === value ? "border-accent/50 bg-accent/[.07] text-accent" : "border-white/10 text-muted"}`}>{label}</button>)}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="font-medium">Preferência de uso</h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {(["local", "api", "both"] as const).map((value) => <button type="button" key={value} onClick={() => set("preference", value)} aria-pressed={profile.preference === value} className={`rounded-xl border px-4 py-3 text-sm ${profile.preference === value ? "border-accent/50 bg-accent/[.07]" : "border-white/10 text-muted"}`}>{value === "local" ? "IA Local" : value === "api" ? "API" : "Ambos"}</button>)}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <article className="rounded-2xl border border-white/10 bg-black/15 p-5"><Cpu className="h-5 w-5 text-accent" aria-hidden="true"/><h2 className="mt-3 font-medium">Máquina</h2><dl className="mt-4 space-y-2 text-sm text-muted"><div><dt className="inline text-muted">Tipo: </dt><dd className="inline">{profile.deviceType === "desktop" ? "Desktop" : "Notebook"}</dd></div><div><dt className="inline text-muted">CPU: </dt><dd className="inline">{profile.cpu}</dd></div><div><dt className="inline text-muted">GPU: </dt><dd className="inline">{profile.gpu}</dd></div><div><dt className="inline text-muted">Memória: </dt><dd className="inline">{profile.vramGb} GB VRAM · {profile.ramGb} GB RAM</dd></div><div><dt className="inline text-muted">Armazenamento: </dt><dd className="inline">{profile.storageFreeGb} GB livres / {profile.storageTotalGb} GB</dd></div><div><dt className="inline text-muted">Sistema: </dt><dd className="inline">{profile.os}{profile.os === "linux" && profile.distro ? ` · ${profile.distro}` : ""}</dd></div></dl></article>
                  <article className="rounded-2xl border border-white/10 bg-black/15 p-5"><Goal className="h-5 w-5 text-accent" aria-hidden="true"/><h2 className="mt-3 font-medium">Objetivos</h2><p className="mt-4 text-sm leading-6 text-muted">{profile.objectives.join(" · ")}</p><p className="mt-4 text-xs text-muted">Preferência: {profile.preference === "local" ? "IA Local" : profile.preference === "api" ? "API" : "Ambos"} · Prioridade: {priorities.find(([value]) => value === profile.priority)?.[1]}</p></article>
                </div>
                <div className="mt-5 rounded-2xl border border-accent/15 bg-accent/[.04] p-4 text-sm text-muted">Seu perfil fica salvo somente neste navegador e pode ser exportado na página Perfil.</div>
                <FieldError message={errors.form} />
              </div>
            )}
          </section>

          <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
            {step > 1 ? <Button type="button" variant="secondary" onClick={() => { setStep((step - 1) as Step); setErrors({}); }}><ArrowLeft className="h-4 w-4" aria-hidden="true"/> Voltar</Button> : <Button variant="secondary" asChild><Link href={editing ? "/dashboard" : "/"}><ArrowLeft className="h-4 w-4" aria-hidden="true"/> {editing ? "Voltar ao dashboard" : "Voltar ao início"}</Link></Button>}
            {step < 3 ? <Button type="submit">Continuar <ArrowRight className="h-4 w-4" aria-hidden="true"/></Button> : <Button type="submit">Salvar perfil <Check className="h-4 w-4" aria-hidden="true"/></Button>}
          </div>
        </form>
      </div>
    </main>
  );
}
