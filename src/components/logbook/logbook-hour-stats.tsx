"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldHelpTip } from "@/components/certification/faa-help-tip";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import { LOGBOOK_FIELD_HELP } from "@/lib/data/faa-resources";
import { ChevronDown, ChevronUp, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogbookHourStatsProps {
  totals: FlightHourTotals;
  flightCount: number;
}

type HelpKey = keyof typeof LOGBOOK_FIELD_HELP;

const primaryStats: { key: keyof FlightHourTotals; helpKey: HelpKey }[] = [
  { key: "total", helpKey: "total_hours" },
  { key: "pic", helpKey: "pic_time" },
  { key: "dual", helpKey: "dual_time" },
  { key: "crossCountry", helpKey: "cross_country_time" },
];

const secondaryStats: {
  key: keyof FlightHourTotals;
  helpKey: HelpKey;
  isCount?: boolean;
}[] = [
  { key: "night", helpKey: "night_time" },
  { key: "instrument", helpKey: "instrument_time" },
  { key: "landings", helpKey: "landings", isCount: true },
];

function StatLabel({ helpKey }: { helpKey: HelpKey }) {
  const help = LOGBOOK_FIELD_HELP[helpKey];
  return (
    <div className="flex items-center gap-0.5">
      <p className="text-xs text-muted-foreground">{help.label}</p>
      <FieldHelpTip label={help.label} tip={help.tip} />
    </div>
  );
}

export function LogbookHourStats({ totals, flightCount }: LogbookHourStatsProps) {
  const [expanded, setExpanded] = useState(false);
  const flightsHelp = LOGBOOK_FIELD_HELP.flights;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {primaryStats.map(({ key, helpKey }) => (
          <Card key={key} className="p-3">
            <StatLabel helpKey={helpKey} />
            <p className="text-lg font-semibold">{formatHours(totals[key])}</p>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2 text-muted-foreground"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        All categories
      </Button>

      <div
        className={cn(
          "grid gap-3 overflow-hidden transition-all sm:grid-cols-2 lg:grid-cols-4",
          expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {secondaryStats.map(({ key, helpKey, isCount }) => (
          <Card key={key} className="p-3">
            <StatLabel helpKey={helpKey} />
            <p className="text-lg font-semibold">
              {isCount ? totals.landings : formatHours(totals[key])}
            </p>
          </Card>
        ))}
        <Card className="p-3">
          <div className="flex items-center gap-0.5">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Plane className="h-3.5 w-3.5 text-sky-600" />
              {flightsHelp.label}
            </p>
            <FieldHelpTip label={flightsHelp.label} tip={flightsHelp.tip} />
          </div>
          <p className="text-lg font-semibold">{flightCount}</p>
        </Card>
      </div>
    </div>
  );
}
