import { Icon } from "@iconify/react";

type KpiBadge = {
  label: string;
  value: string;
  icon: string;
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  badges?: KpiBadge[];
};

export default function PageHeader({
  eyebrow = "FRAUDIA",
  title,
  description,
  badges,
}: PageHeaderProps) {
  return (
    <header className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-400/90">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
          {title}
        </h1>
        <p className="max-w-3xl text-base text-zinc-400 sm:text-lg">{description}</p>
      </div>

      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-[#111827]/80 px-4 py-2.5 shadow-sm transition-all duration-200 hover:border-zinc-700"
            >
              <Icon icon={badge.icon} className="text-lg text-red-400" />
              <span className="text-xs text-zinc-500">{badge.label}</span>
              <span className="text-sm font-semibold text-white">{badge.value}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
