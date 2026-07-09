import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type PlaceholderStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
};

export function PlaceholderState({
  icon: Icon,
  title,
  description,
  bullets,
}: PlaceholderStateProps) {
  return (
    <Card className="border-dashed border-border/80 bg-background/75 shadow-sm shadow-black/5">
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/8 text-primary ring-1 ring-primary/10">
          <Icon className="size-7" />
        </div>

        <div className="space-y-3">
          <Badge variant="outline">Placeholder module</Badge>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {bullets.map((bullet) => (
            <div
              key={bullet}
              className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-3 text-sm leading-6 text-muted-foreground"
            >
              {bullet}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
