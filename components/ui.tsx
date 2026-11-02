import type { ReactNode } from "react";

type Tone = "default" | "positive" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  default: "text-zinc-900",
  positive: "text-emerald-600",
  warning: "text-amber-600",
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
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold tabular-nums ${toneClass[tone]}`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        ) : null}
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
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export function ReadOnlyNote() {
  return (
    <p className="rounded-lg bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
      Read-only demo — data is read directly from Compound III on Base. No
      wallet connection or transactions are involved.
    </p>
  );
}
