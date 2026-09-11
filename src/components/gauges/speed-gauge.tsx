import { clampPercent, metricStatus, statusLabel } from "@/features/dashboard/metrics";

type GaugeProps = {
  label: string;
  value: number;
  max: number;
  unit: string;
  displayValue?: string;
  description?: string;
  kind?: "capacity" | "performance";
};

export function SpeedGauge({ label, value, max, unit, displayValue, description, kind = "capacity" }: GaugeProps) {
  const percent = clampPercent(value, max);
  const status = metricStatus(value, max);
  const usagePercent = max > 0 ? value / max * 100 : 0;
  const angle = -90 + (Math.min(percent, 100) / 100) * 180;
  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">{label}</h2>
        <span className="text-xs text-muted">{kind === "performance" ? "Faixa estimada" : max === 0 ? "Sem capacidade" : statusLabel(status)}</span>
      </div>
      <div className="relative mx-auto mt-3 aspect-[2/1.18] max-w-[220px] overflow-hidden" role="img" aria-label={`${label}: ${displayValue ?? `${value} ${unit}`}`}>
        <svg viewBox="0 0 240 145" className="h-full w-full" aria-hidden="true">
          <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="14" strokeLinecap="round" pathLength="100" />
          <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="currentColor" className={kind === "performance" ? "text-accent" : status === "insufficient" ? "text-rose-300" : status === "limit" ? "text-amber-300" : status === "moderate" ? "text-yellow-200" : "text-accent"} strokeWidth="14" strokeLinecap="round" pathLength="100" strokeDasharray={`${Math.min(percent, 100)} 100`} />
          <g transform={`rotate(${angle} 120 120)`}>
            <line x1="120" y1="120" x2="120" y2="48" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle cx="120" cy="120" r="7" fill="white" />
        </svg>
      </div>
      <div className="text-center">
          <strong className="block text-2xl tracking-tight">{displayValue ?? `${value.toFixed(1)} ${unit}`}</strong>
          <span className="text-xs text-muted">{kind === "performance" ? "Geração de tokens" : max > 0 ? `${Math.round(usagePercent)}% de ${max} ${unit}` : `0 ${unit} disponíveis`}</span>
      </div>
      {description && <p className="mt-3 text-center text-xs leading-5 text-muted">{description}</p>}
    </article>
  );
}
