interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({ active, activeLabel = "Active", inactiveLabel = "Inactive" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${active
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
      : 'bg-muted text-muted-foreground'
      }`}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
