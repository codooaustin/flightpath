"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format, isSameMonth, startOfMonth } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DashboardFaaMobileButton,
  DashboardFaaSidebar,
} from "@/components/dashboard/dashboard-faa-sidebar";
import { JournalEmptyState } from "@/components/journal/journal-empty-state";
import { JournalEntryDetailDialog } from "@/components/journal/journal-entry-detail-dialog";
import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { JournalHero } from "@/components/journal/journal-hero";
import { deleteJournalEntry } from "@/lib/actions/journal";
import { getNextActionableMission, getCurrentStage } from "@/lib/calculations/progress";
import { getJournalReflectionResources } from "@/lib/data/journal-guidance";
import { getStageResources } from "@/lib/data/stage-guidance";
import {
  getMissionJournalSuggestion,
  type JournalTemplate,
} from "@/lib/journal/entry-templates";
import type { JournalEntry, Mission, Stage, UserMission } from "@/types/models";
import { Plus, Search, Target } from "lucide-react";
import { toast } from "sonner";

type TimeFilter = "all" | "this_month";
type MissionFilter = "all" | string;

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "this_month", label: "This month" },
];

interface JournalContentProps {
  entries: JournalEntry[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  stages: Stage[];
  birthDate: string | null;
  isStudent: boolean;
  initialOpenEntryId?: string | null;
  initialOpenNew?: boolean;
  initialMissionId?: string | null;
}

function JournalListItem({
  entry,
  missionTitle,
  onSelect,
}: {
  entry: JournalEntry;
  missionTitle?: string;
  onSelect: (entry: JournalEntry) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className="flex w-full flex-col gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium leading-snug">{entry.title}</p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {format(new Date(entry.entry_date), "MMM d, yyyy")}
        </p>
      </div>
      {missionTitle && (
        <Badge variant="outline" className="w-fit gap-1 font-normal">
          <Target className="h-3 w-3" />
          {missionTitle}
        </Badge>
      )}
      <p className="line-clamp-3 text-sm text-muted-foreground">
        {entry.content}
      </p>
    </button>
  );
}

export function JournalContent({
  entries,
  missions,
  userMissions,
  stages,
  birthDate,
  isStudent,
  initialOpenEntryId,
  initialOpenNew = false,
  initialMissionId,
}: JournalContentProps) {
  const searchParams = useSearchParams();
  const currentStage = getCurrentStage(stages, missions, userMissions);
  const nextMission = getNextActionableMission(
    userMissions,
    missions,
    birthDate,
    stages
  );
  const missionSuggestion = getMissionJournalSuggestion(
    nextMission?.mission?.title
  );

  const missionMap = useMemo(
    () => new Map(missions.map((mission) => [mission.id, mission])),
    [missions]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [missionFilter, setMissionFilter] = useState<MissionFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [missionId, setMissionId] = useState("none");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [formDefaults, setFormDefaults] = useState<{
    title?: string;
    content?: string;
  }>({});

  const reflectionResources = getJournalReflectionResources();
  const stageResources = currentStage
    ? getStageResources(currentStage.name)
    : [];
  const supplementalFaaResources = reflectionResources.filter(
    (resource) =>
      !stageResources.some(
        (existing) => existing.milestoneId === resource.milestoneId
      )
  );

  const linkedMissions = useMemo(() => {
    const ids = new Set(
      entries
        .map((entry) => entry.mission_id)
        .filter((id): id is string => id != null)
    );
    return missions.filter((mission) => ids.has(mission.id));
  }, [entries, missions]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const monthStart = startOfMonth(new Date());

    return entries.filter((entry) => {
      if (timeFilter === "this_month") {
        if (!isSameMonth(new Date(entry.entry_date), monthStart)) return false;
      }
      if (missionFilter !== "all" && entry.mission_id !== missionFilter) {
        return false;
      }
      if (!query) return true;
      return (
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query)
      );
    });
  }, [entries, searchQuery, timeFilter, missionFilter]);

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, JournalEntry[]>();

    for (const entry of filteredEntries) {
      const key = format(new Date(entry.entry_date), "yyyy-MM");
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    }

    return [...groups.entries()].sort(([left], [right]) =>
      right.localeCompare(left)
    );
  }, [filteredEntries]);

  const recentEntry = entries[0] ?? null;

  useEffect(() => {
    if (initialOpenNew && isStudent) {
      setEditingEntry(null);
      setFormDefaults({});
      if (nextMission?.mission_id) setMissionId(nextMission.mission_id);
      setFormOpen(true);
    }
  }, [initialOpenNew, isStudent, nextMission?.mission_id]);

  useEffect(() => {
    const openId = initialOpenEntryId ?? searchParams.get("open");
    if (!openId) return;
    const entry = entries.find((item) => item.id === openId);
    if (entry) setSelectedEntry(entry);
  }, [initialOpenEntryId, searchParams, entries]);

  useEffect(() => {
    const missionParam = initialMissionId ?? searchParams.get("mission");
    if (missionParam && missionMap.has(missionParam)) {
      setMissionId(missionParam);
    }
  }, [initialMissionId, searchParams, missionMap]);

  function handleFormDialogChange(nextOpen: boolean) {
    setFormOpen(nextOpen);
    if (!nextOpen) {
      setEditingEntry(null);
      setFormDefaults({});
      if (!initialMissionId && !searchParams.get("mission")) {
        setMissionId("none");
      }
    }
  }

  function openNewEntry(options?: {
    title?: string;
    content?: string;
    missionId?: string;
  }) {
    setEditingEntry(null);
    setFormDefaults({ title: options?.title, content: options?.content });
    if (options?.missionId) setMissionId(options.missionId);
    else if (nextMission?.mission_id) setMissionId(nextMission.mission_id);
    setFormOpen(true);
  }

  function openEdit(entry: JournalEntry) {
    setSelectedEntry(null);
    setEditingEntry(entry);
    setMissionId(entry.mission_id ?? "none");
    setFormDefaults({});
    setFormOpen(true);
  }

  function openTemplate(template: JournalTemplate) {
    openNewEntry({
      title: template.title,
      content: template.content,
      missionId: nextMission?.mission_id,
    });
  }

  async function handleDelete(entry: JournalEntry) {
    if (
      !window.confirm(
        `Delete "${entry.title}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setLoading(true);
    const result = await deleteJournalEntry(entry.id);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Entry deleted");
      setSelectedEntry(null);
    }
  }

  const hasFilters =
    searchQuery.trim().length > 0 ||
    timeFilter !== "all" ||
    missionFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">
            Capture your thoughts and milestones
          </p>
        </div>
        <DashboardFaaMobileButton
          resources={stageResources}
          supplemental={supplementalFaaResources}
        />
      </div>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <JournalHero
            recentEntry={recentEntry}
            entryCount={entries.length}
            isStudent={isStudent}
            onNewEntry={() => openNewEntry()}
          />

          {entries.length > 0 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {TIME_FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      timeFilter === filter.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setTimeFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
                {linkedMissions.length > 0 && (
                  <>
                    <span className="mx-1 hidden h-6 w-px bg-border sm:inline" />
                    <Button
                      variant={missionFilter === "all" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setMissionFilter("all")}
                    >
                      All missions
                    </Button>
                    {linkedMissions.map((mission) => (
                      <Button
                        key={mission.id}
                        variant={
                          missionFilter === mission.id ? "secondary" : "outline"
                        }
                        size="sm"
                        onClick={() => setMissionFilter(mission.id)}
                      >
                        {mission.title}
                      </Button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {entries.length === 0 ? (
            <JournalEmptyState
              missionSuggestion={missionSuggestion}
              isStudent={isStudent}
              onUseTemplate={openTemplate}
              onNewEntry={() => openNewEntry()}
            />
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No entries match your {hasFilters ? "filters" : "search"}.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {groupedEntries.map(([monthKey, monthEntries]) => {
                const monthDate = new Date(`${monthKey}-01T12:00:00`);
                return (
                  <section key={monthKey} className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {format(monthDate, "MMMM yyyy")}
                    </h2>
                    <div className="space-y-3">
                      {monthEntries.map((entry) => (
                        <JournalListItem
                          key={entry.id}
                          entry={entry}
                          missionTitle={
                            entry.mission_id
                              ? missionMap.get(entry.mission_id)?.title
                              : undefined
                          }
                          onSelect={setSelectedEntry}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <DashboardFaaSidebar
          resources={stageResources}
          supplemental={supplementalFaaResources}
          defaultOpen
          storageKey="flightpath-journal-faa-sidebar"
        />
      </div>

      {isStudent && (
        <Button
          className="fixed bottom-6 right-6 z-40 shadow-lg lg:hidden"
          size="icon"
          onClick={() => openNewEntry()}
          aria-label="New journal entry"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={formOpen} onOpenChange={handleFormDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Entry" : "New Journal Entry"}
            </DialogTitle>
          </DialogHeader>
          <JournalEntryForm
            key={editingEntry?.id ?? `new-${formDefaults.title ?? ""}`}
            entry={editingEntry ?? undefined}
            missions={missions}
            userMissions={userMissions}
            missionId={missionId}
            setMissionId={setMissionId}
            defaultTitle={formDefaults.title}
            defaultContent={formDefaults.content}
            loading={loading}
            setLoading={setLoading}
            onSuccess={() => handleFormDialogChange(false)}
          />
        </DialogContent>
      </Dialog>

      <JournalEntryDetailDialog
        entry={selectedEntry}
        mission={
          selectedEntry?.mission_id
            ? missionMap.get(selectedEntry.mission_id) ?? null
            : null
        }
        isStudent={isStudent}
        loading={loading}
        onClose={() => setSelectedEntry(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
