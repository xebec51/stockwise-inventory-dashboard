import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type DataEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  hint: string;
};

export function DataEmptyState({
  icon: Icon,
  title,
  description,
  hint,
}: DataEmptyStateProps) {
  return (
    <Card className="stockwise-panel border-dashed bg-card/75">
      <CardContent className="flex flex-col items-start gap-5 p-6 sm:p-8">
        <div className="stockwise-grid flex size-16 items-center justify-center rounded-3xl bg-primary/8 text-primary ring-1 ring-primary/15">
          <Icon className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {hint}
        </div>
      </CardContent>
    </Card>
  );
}
