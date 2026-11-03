import type { ReactNode } from "react";

type Tone = "default" | "positive" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  default: "text-[#1c8eff]",
  positive: "text-emerald-600",
  warning: "text-[#ff24cc]",
  danger: "text-red-600",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="rounded-lg border border-[#262626] bg-[#141414] p-4">
      <p className="text-lg font-medium tracking-wide text-white">
        {label}
      </p>
      <p
        className={`mt-4 text-2xl font-bold tabular-nums ${toneClass[tone]}`}
      >
        {value}
      </p>
      {hint ? <p className="mt-4 text-xs text-zinc-300">{hint}</p> : null}
    </div>
  );
}

export function SectionHeading({
  title,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-wide text-white">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

const badgeToneClass = {
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeToneClass;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeToneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#3e3e40] bg-[#2a2b2b] px-6 py-12 text-center">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export function ReadOnlyNote() {
  return (
    <p className="rounded-lg text-center text-[#738fff] bg-[#1a1f66] border border-[#738fff] px-4 py-3 text-sm text-#738fff">
      Read-only demo — data is read directly from Compound III on Base. 
    </p>
  );
}
