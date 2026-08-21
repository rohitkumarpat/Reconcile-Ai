import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 border border-dashed border-border rounded-xl bg-white">
      <h3 className="font-display font-semibold text-ink">
        {title}
      </h3>

      <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
        {description}
      </p>

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}