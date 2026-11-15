import { CircleCheck, Sparkles } from "lucide-react";

import {
  PageContainer,
  PageHeader,
} from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findNavItem } from "@/constants/navigation";

/**
 * Stand-in body for sections that are part of the plan but not built yet.
 * It deliberately shows no fake data — only an honest description of what
 * will live here.
 *
 * Usage inside a route page: `<PlaceholderPage href="/trips" />`
 */
export function PlaceholderPage({ href }: { href: string }) {
  const item = findNavItem(href);
  if (!item) return null;

  const Icon = item.icon;

  return (
    <PageContainer>
      <PageHeader
        title={item.label}
        description={item.description}
        actions={<Badge variant="outline">Planned</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest">
              <Icon className="size-4" aria-hidden />
            </span>
            This section is not built yet
          </CardTitle>
          <CardDescription>
            The navigation, layout and design system are in place so this page
            can be implemented next without touching the shell.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <Sparkles
              className="mt-0.5 size-4 shrink-0 text-brand-accent"
              aria-hidden
            />
            <span>
              <span className="font-medium text-foreground">{item.label}</span>{" "}
              will be built on the shared foundations: the Dexie offline store,
              the Firebase sync layer and these UI components.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <CircleCheck
              className="mt-0.5 size-4 shrink-0 text-brand-sage"
              aria-hidden
            />
            <span>
              Nothing here is mocked. Sample values only ever appear on the
              dashboard preview, and they are labelled as such.
            </span>
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
