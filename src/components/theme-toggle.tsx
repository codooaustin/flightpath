"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        showLabel && "justify-between",
        className
      )}
    >
      {showLabel && (
        <span className="text-sm text-muted-foreground">Dark mode</span>
      )}
      <div className="flex items-center gap-2">
        <Sun
          className={cn(
            "h-4 w-4 shrink-0",
            mounted && !isDark ? "text-foreground" : "text-muted-foreground"
          )}
          aria-hidden
        />
        <Switch
          checked={mounted ? isDark : false}
          disabled={!mounted}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label="Toggle dark mode"
        />
        <Moon
          className={cn(
            "h-4 w-4 shrink-0",
            mounted && isDark ? "text-foreground" : "text-muted-foreground"
          )}
          aria-hidden
        />
      </div>
    </div>
  );
}
