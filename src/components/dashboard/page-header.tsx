import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="stockwise-panel stockwise-signal flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="relative max-w-2xl space-y-3">
        {eyebrow ? (
          <Badge className="border-cyan-200/70 bg-cyan-50 text-cyan-800 hover:bg-cyan-50 dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-100">
            {eyebrow}
          </Badge>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
      </div>
      {action ? <div className="relative shrink-0">{action}</div> : null}
    </div>
  );
}
