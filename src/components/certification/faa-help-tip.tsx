"use client";

import { ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { FaaResource } from "@/lib/data/faa-resources";

interface FaaHelpTipProps {
  resource: FaaResource;
  className?: string;
}

export function FaaHelpTip({ resource, className }: FaaHelpTipProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-6 w-6 shrink-0 text-muted-foreground hover:text-sky-600 ${className ?? ""}`}
            aria-label={`FAA info: ${resource.title}`}
          >
            <Info className="h-4 w-4" />
          </Button>
        }
      />
      <PopoverContent className="w-80" align="start">
        <PopoverHeader>
          <PopoverTitle>{resource.title}</PopoverTitle>
          <PopoverDescription>{resource.summary}</PopoverDescription>
        </PopoverHeader>
        <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
          {resource.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline"
        >
          {resource.urlLabel}
          <ExternalLink className="h-3 w-3" />
        </a>
      </PopoverContent>
    </Popover>
  );
}

interface FaaHelpLinkProps {
  resource: FaaResource;
  className?: string;
}

export function FaaHelpLink({ resource, className }: FaaHelpLinkProps) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-sm text-sky-600 hover:underline ${className ?? ""}`}
    >
      {resource.urlLabel}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

interface FaaGuidancePanelProps {
  resources: FaaResource[];
}

export function FaaGuidancePanel({ resources }: FaaGuidancePanelProps) {
  if (resources.length === 0) return null;

  return (
    <div className="space-y-3 border-t pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        FAA Guidance
      </p>
      {resources.map((resource) => (
        <div key={resource.milestoneId} className="space-y-1">
          <div className="flex items-start gap-1">
            <p className="text-sm font-medium">{resource.title}</p>
            <FaaHelpTip resource={resource} />
          </div>
          <p className="text-xs text-muted-foreground">{resource.summary}</p>
          <FaaHelpLink resource={resource} className="text-xs" />
        </div>
      ))}
    </div>
  );
}

interface FieldHelpTipProps {
  tip: string;
  label: string;
}

export function FieldHelpTip({ tip, label }: FieldHelpTipProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-sky-600"
            aria-label={`Help: ${label}`}
          >
            <Info className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <PopoverContent className="w-64" align="start">
        <p className="text-sm text-muted-foreground">{tip}</p>
      </PopoverContent>
    </Popover>
  );
}
