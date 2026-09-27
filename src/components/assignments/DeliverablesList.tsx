export interface DeliverablesListProps {
  items: string[];
}

export function DeliverablesList({ items }: DeliverablesListProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        Deliverables
      </p>
      <ul className="space-y-1">
        {items.map((d, i) => (
          <li
            key={`${i}-${d}`}
            className="flex items-start gap-2 text-sm text-slate-700"
          >
            <span
              className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
              aria-hidden="true"
            />
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}