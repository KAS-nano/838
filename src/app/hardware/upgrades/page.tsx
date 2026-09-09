"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useHardwareProfile } from "@/features/profile/use-hardware-profile";
import { simulateUpgrade, suggestUpgrades } from "@/features/hardware/upgrades";

export default function UpgradesPage(){
 const {profile}=useHardwareProfile();
 const [selectedRam,setRam]=useState<number|null>(null); const [selectedVram,setVram]=useState<number|null>(null);
 const ram=selectedRam??Math.max(32,profile.ramGb), vram=selectedVram??Math.max(16,profile.vramGb);
 const suggestions=useMemo(()=>suggestUpgrades(profile),[profile]); const sim=useMemo(()=>simulateUpgrade(profile,{ramGb:ram,vramGb:vram}),[profile,ram,vram]);
 return <main><div className="page-container"><section><div className="page-heading"><div><p className="text-xs uppercase tracking-[.2em] text-accent">Simulador</p><h1 className="page-title">O que um upgrade mudaria?</h1></div><Link href="/hardware/forca" className="text-sm text-accent">Força do PC</Link></div><div className="mt-6 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="panel p-5"><label className="block text-sm">RAM simulada: <strong>{ram} GB</strong><input type="range" min="2" max={Math.max(128,profile.ramGb)} step="8" value={ram} onChange={e=>setRam(Number(e.target.value))} className="mt-3 w-full"/></label><label className="mt-6 block text-sm">VRAM simulada: <strong>{vram} GB</strong><input type="range" min="0" max={Math.max(48,profile.vramGb)} step="2" value={vram} onChange={e=>setVram(Number(e.target.value))} className="mt-3 w-full"/></label><div className="mt-7 space-y-2">{sim.delta.map(x=><div key={x.category} className="flex justify-between rounded-xl bg-black/20 p-3 text-sm"><span>{x.category}</span><span>{x.before} → {x.after} <strong className={x.gain>0?"text-accent":"text-muted"}>{x.gain>0?`+${x.gain}`:"0"}</strong></span></div>)}</div></div><div><h2 className="text-lg font-semibold">Sugestões para a configuração atual</h2><div className="mt-3 space-y-3">{suggestions.length?suggestions.map(s=><article key={s.kind} className="panel p-4"><div className="flex justify-between"><span className="text-xs uppercase text-accent">{s.kind}</span><span className="text-xs text-muted">Prioridade {s.priority}</span></div><h3 className="mt-2 font-semibold">{s.title} · {s.target}</h3><p className="mt-2 text-sm text-muted">{s.benefit}</p></article>):<p className="text-sm text-muted">Nenhum upgrade óbvio é necessário para o perfil atual; compare modelos específicos antes de gastar.</p>}</div></div></div></section></div></main>
}
