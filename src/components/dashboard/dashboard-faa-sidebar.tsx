"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FaaGuidancePanel,
} from "@/components/certification/faa-help-tip";
import type { FaaResource } from "@/lib/data/faa-resources";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight } from "lucide-react";

const STORAGE_KEY = "flightpath-dashboard-faa-sidebar";

function mergeFaaResources(
  primary: FaaResource[],
  supplemental: FaaResource[]
): FaaResource[] {
  const seen = new Set<string>();

  return [...primary, ...supplemental].filter((resource) => {
    if (seen.has(resource.milestoneId)) return false;
    seen.add(resource.milestoneId);
    return true;
  });
}

function FaaSidebarContent({
  resources,
  supplemental,
}: {
  resources: FaaResource[];
  supplemental: FaaResource[];
}) {
  const allResources = mergeFaaResources(resources, supplemental);

  if (allResources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No FAA resources for your current training stage.
      </p>
    );
  }

  return <FaaGuidancePanel resources={allResources} />;
}

interface DashboardFaaSidebarProps {
  resources: FaaResource[];
  supplemental: FaaResource[];
  defaultOpen: boolean;
}

export function DashboardFaaMobileButton({
  resources,
  supplemental,
}: Pick<DashboardFaaSidebarProps, "resources" | "supplemental">) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 lg:hidden">
            <BookOpen className="h-4 w-4" />
            FAA Resources
          </Button>
        }
      />
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>FAA Resources</SheetTitle>
        </SheetHeader>
        <FaaSidebarContent resources={resources} supplemental={supplemental} />
      </SheetContent>
    </Sheet>
  );
}

export function DashboardFaaSidebar({
  resources,
  supplemental,
  defaultOpen,
}: DashboardFaaSidebarProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setOpen(stored === "true");
    }
  }, []);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  const hasContent = resources.length > 0 || supplemental.length > 0;

  return (
    <div className="hidden shrink-0 lg:flex lg:items-start lg:gap-2">
      <Button
        type="button"
        variant="outline"
        size={open ? "icon-sm" : "sm"}
        onClick={toggle}
        className={cn(
          "sticky top-6",
          !open && "h-auto flex-col gap-1 px-2 py-2"
        )}
        aria-label={open ? "Hide FAA resources" : "Show FAA resources"}
        title={open ? "Hide FAA resources" : "FAA resources"}
      >
        {open ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <>
            <BookOpen className="h-4 w-4 text-sky-600" />
            <span className="text-[10px] font-semibold leading-none tracking-wide">
              FAA
            </span>
          </>
        )}
      </Button>
      <aside
        className={cn(
          "sticky top-6 overflow-hidden transition-all duration-200",
          open ? "w-72 xl:w-80" : "w-0"
        )}
      >
        {open && (
          <div className="max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sky-600" />
              <h2 className="text-sm font-semibold">FAA Resources</h2>
            </div>
            {hasContent ? (
              <FaaSidebarContent
                resources={resources}
                supplemental={supplemental}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No FAA resources for your current training stage.
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
