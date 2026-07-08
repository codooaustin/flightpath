"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { CalendarEmptyState } from "@/components/calendar/calendar-empty-state";
import { CalendarEventDetailDialog } from "@/components/calendar/calendar-event-detail-dialog";
import { CalendarEventForm } from "@/components/calendar/calendar-event-form";
import { CalendarHero } from "@/components/calendar/calendar-hero";
import {
  deleteEvent,
  toggleEventComplete,
} from "@/lib/actions/calendar";
import {
  EVENT_TYPE_DOT_CLASS,
  eventTypeBadgeClass,
} from "@/lib/calendar/event-styles";
import {
  getMissionEventSuggestion,
  type EventTemplate,
} from "@/lib/calendar/event-templates";
import { getNextActionableMission, getCurrentStage } from "@/lib/calculations/progress";
import { getCalendarSchedulingResources } from "@/lib/data/calendar-guidance";
import { getStageResources } from "@/lib/data/stage-guidance";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type {
  CalendarEvent,
  EventType,
  Flight,
  Mission,
  Stage,
  UserMission,
} from "@/types/models";
import { cn } from "@/lib/utils";
import { ChevronDown, Plane, Plus } from "lucide-react";
import { toast } from "sonner";
import type { DayButton } from "react-day-picker";

type StatusFilter = "upcoming" | "all" | "completed";
type TypeFilter = "all" | EventType;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  ...Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
    value: value as EventType,
    label,
  })),
];

interface CalendarContentProps {
  events: CalendarEvent[];
  flights: Flight[];
  stages: Stage[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  birthDate: string | null;
  isStudent: boolean;
  initialDate?: string | null;
  initialOpenEventId?: string | null;
}

function matchesFilters(
  event: CalendarEvent,
  statusFilter: StatusFilter,
  typeFilter: TypeFilter
): boolean {
  if (typeFilter !== "all" && event.type !== typeFilter) return false;
  if (statusFilter === "completed") return event.completed;
  if (statusFilter === "upcoming") return !event.completed;
  return true;
}

function EventAgendaItem({
  event,
  onSelect,
}: {
  event: CalendarEvent;
  onSelect: (event: CalendarEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="flex w-full items-start justify-between gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "font-medium",
              event.completed && "line-through opacity-60"
            )}
          >
            {event.title}
          </p>
          <Badge
            variant="outline"
            className={eventTypeBadgeClass(event.type as EventType)}
          >
            {EVENT_TYPE_LABELS[event.type as EventType]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(event.start_date), "h:mm a")}
          {event.end_date &&
            ` – ${format(new Date(event.end_date), "h:mm a")}`}
        </p>
      </div>
    </button>
  );
}

function FlightAgendaItem({ flight }: { flight: Flight }) {
  return (
    <Link
      href="/logbook"
      className="flex items-start justify-between gap-2 rounded-lg border border-dashed bg-muted/20 p-3 transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">
            {flight.aircraft ?? "Flight"}
            {flight.tail_number ? ` (${flight.tail_number})` : ""}
          </p>
          <Badge variant="outline" className="font-normal">
            Logged flight
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {flight.flight_time} hrs logged
          {flight.instructor ? ` · ${flight.instructor}` : ""}
        </p>
      </div>
      <Plane className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function CalendarContent({
  events,
  flights,
  stages,
  missions,
  userMissions,
  birthDate,
  isStudent,
  initialDate,
  initialOpenEventId,
}: CalendarContentProps) {
  const searchParams = useSearchParams();
  const currentStage = getCurrentStage(stages, missions, userMissions);
  const nextMission = getNextActionableMission(
    userMissions,
    missions,
    birthDate,
    stages
  );
  const missionSuggestion = getMissionEventSuggestion(
    nextMission?.mission?.title
  );

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => new Date());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [monthOverviewOpen, setMonthOverviewOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState<EventType>("study");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formDefaults, setFormDefaults] = useState<{
    title?: string;
    description?: string;
    type?: EventType;
  }>({});

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        matchesFilters(event, statusFilter, typeFilter)
      ),
    [events, statusFilter, typeFilter]
  );

  const upcomingEvents = useMemo(
    () =>
      events
        .filter(
          (event) =>
            !event.completed &&
            new Date(event.start_date) >= startOfDay(new Date())
        )
        .sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        ),
    [events]
  );

  const nextEvent = upcomingEvents[0] ?? null;

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of filteredEvents) {
      const key = format(new Date(event.start_date), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [filteredEvents]);

  const flightsByDay = useMemo(() => {
    const map = new Map<string, Flight[]>();
    for (const flight of flights) {
      const key = flight.date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(flight);
      map.set(key, list);
    }
    return map;
  }, [flights]);

  const eventDates = useMemo(
    () => filteredEvents.map((event) => new Date(event.start_date)),
    [filteredEvents]
  );

  const monthEvents = useMemo(
    () =>
      filteredEvents
        .filter((event) =>
          isSameMonth(new Date(event.start_date), visibleMonth)
        )
        .sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        ),
    [filteredEvents, visibleMonth]
  );

  const groupedMonthEvents = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    for (const event of monthEvents) {
      const key = format(new Date(event.start_date), "yyyy-MM-dd");
      const dayEvents = groups.get(key) ?? [];
      dayEvents.push(event);
      groups.set(key, dayEvents);
    }
    return [...groups.entries()].sort(([left], [right]) =>
      left.localeCompare(right)
    );
  }, [monthEvents]);

  const selectedDayKey = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;
  const selectedDayEvents = selectedDayKey
    ? (eventsByDay.get(selectedDayKey) ?? []).sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      )
    : [];
  const selectedDayFlights = selectedDayKey
    ? (flightsByDay.get(selectedDayKey) ?? [])
    : [];

  const schedulingResources = getCalendarSchedulingResources();
  const stageResources = currentStage
    ? getStageResources(currentStage.name)
    : [];
  const supplementalFaaResources = schedulingResources.filter(
    (resource) =>
      !stageResources.some(
        (existing) => existing.milestoneId === resource.milestoneId
      )
  );

  useEffect(() => {
    const dateParam = initialDate ?? searchParams.get("date");
    if (dateParam) {
      const parsed = parseISO(dateParam);
      if (isValid(parsed)) {
        setSelectedDate(parsed);
        setVisibleMonth(parsed);
      }
    }
  }, [initialDate, searchParams]);

  useEffect(() => {
    const openId = initialOpenEventId ?? searchParams.get("open");
    if (!openId) return;
    const event = events.find((item) => item.id === openId);
    if (event) setSelectedEvent(event);
  }, [initialOpenEventId, searchParams, events]);

  function handleFormDialogChange(nextOpen: boolean) {
    setFormOpen(nextOpen);
    if (!nextOpen) {
      setEditingEvent(null);
      setEventType("study");
      setFormDefaults({});
    }
  }

  function openCreate(options?: {
    title?: string;
    description?: string;
    type?: EventType;
  }) {
    setEditingEvent(null);
    setEventType(options?.type ?? "study");
    setFormDefaults(options ?? {});
    setFormOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    setSelectedEvent(null);
    setEditingEvent(event);
    setEventType(event.type);
    setFormDefaults({});
    setFormOpen(true);
  }

  function openTemplate(template: EventTemplate) {
    openCreate({
      title: template.title,
      description: template.description,
      type: template.type,
    });
  }

  async function handleDelete(event: CalendarEvent) {
    if (
      !window.confirm(
        `Delete "${event.title}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setLoading(true);
    const result = await deleteEvent(event.id);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Event deleted");
      setSelectedEvent(null);
    }
  }

  async function handleToggleComplete(event: CalendarEvent) {
    setLoading(true);
    const result = await toggleEventComplete(event.id, !event.completed);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else setSelectedEvent(null);
  }

  const CustomDayButton: typeof DayButton = (props) => {
    const dayKey = format(props.day.date, "yyyy-MM-dd");
    const dayEvents = eventsByDay.get(dayKey) ?? [];
    const dayFlights = flightsByDay.get(dayKey) ?? [];
    const types = [
      ...new Set(dayEvents.map((event) => event.type as EventType)),
    ];
    const hasFlights = dayFlights.length > 0;

    return (
      <div className="relative flex h-full w-full flex-col items-center">
        <CalendarDayButton
          {...props}
          className={cn(
            props.className,
            (dayEvents.length > 0 || hasFlights) && "font-semibold"
          )}
        />
        {(types.length > 0 || hasFlights) && (
          <div className="pointer-events-none absolute bottom-0.5 flex gap-0.5">
            {types.slice(0, 3).map((type) => (
              <span
                key={type}
                className={cn("size-1 rounded-full", EVENT_TYPE_DOT_CLASS[type])}
              />
            ))}
            {hasFlights && (
              <span className="size-1 rounded-full bg-muted-foreground/60" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Plan flights, study sessions, and milestones
          </p>
        </div>
        <DashboardFaaMobileButton
          resources={stageResources}
          supplemental={supplementalFaaResources}
        />
      </div>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <CalendarHero
            nextEvent={nextEvent}
            isStudent={isStudent}
            onAddEvent={() => openCreate()}
          />

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
            <span className="mx-1 hidden h-6 w-px bg-border sm:inline" />
            {TYPE_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={typeFilter === filter.value ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-5">
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {format(visibleMonth, "MMMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 sm:p-4 sm:pt-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={visibleMonth}
                  onMonthChange={setVisibleMonth}
                  modifiers={{ hasEvent: eventDates }}
                  modifiersClassNames={{
                    hasEvent: "bg-sky-50 dark:bg-sky-950/30",
                  }}
                  className="w-full [--cell-size:--spacing(8)] sm:[--cell-size:--spacing(9)]"
                  components={{ DayButton: CustomDayButton }}
                />
              </CardContent>
            </Card>

            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMMM d")
                    : "Select a day"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedDayEvents.length + selectedDayFlights.length === 0
                    ? "No items on this day"
                    : `${selectedDayEvents.length} event${selectedDayEvents.length === 1 ? "" : "s"}${selectedDayFlights.length > 0 ? ` · ${selectedDayFlights.length} logged flight${selectedDayFlights.length === 1 ? "" : "s"}` : ""}`}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDayEvents.length === 0 &&
                selectedDayFlights.length === 0 ? (
                  <CalendarEmptyState
                    selectedDate={selectedDate}
                    missionSuggestion={missionSuggestion}
                    isStudent={isStudent}
                    onUseTemplate={openTemplate}
                    onAddEvent={() => openCreate()}
                  />
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map((event) => (
                      <EventAgendaItem
                        key={event.id}
                        event={event}
                        onSelect={setSelectedEvent}
                      />
                    ))}
                    {selectedDayFlights.map((flight) => (
                      <FlightAgendaItem key={flight.id} flight={flight} />
                    ))}
                  </div>
                )}

                {groupedMonthEvents.length > 0 && (
                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between px-0"
                      onClick={() => setMonthOverviewOpen((open) => !open)}
                    >
                      <span>
                        Rest of {format(visibleMonth, "MMMM")} (
                        {monthEvents.length} event
                        {monthEvents.length === 1 ? "" : "s"})
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          monthOverviewOpen && "rotate-180"
                        )}
                      />
                    </Button>
                    {monthOverviewOpen && (
                      <div className="space-y-4 pt-2">
                        {groupedMonthEvents.map(([dayKey, dayEvents]) => {
                          const dayDate = new Date(`${dayKey}T12:00:00`);
                          if (selectedDate && isSameDay(dayDate, selectedDate)) {
                            return null;
                          }

                          return (
                            <section key={dayKey} className="space-y-2">
                              <h3 className="text-sm font-medium text-muted-foreground">
                                {format(dayDate, "EEEE, MMM d")}
                              </h3>
                              <div className="space-y-2">
                                {dayEvents.map((event) => (
                                  <EventAgendaItem
                                    key={event.id}
                                    event={event}
                                    onSelect={(item) => {
                                      setSelectedDate(dayDate);
                                      setSelectedEvent(item);
                                    }}
                                  />
                                ))}
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DashboardFaaSidebar
          resources={stageResources}
          supplemental={supplementalFaaResources}
          defaultOpen
          storageKey="flightpath-calendar-faa-sidebar"
        />
      </div>

      {isStudent && (
        <Button
          className="fixed bottom-6 right-6 z-40 shadow-lg lg:hidden"
          size="icon"
          onClick={() => openCreate()}
          aria-label="Add event"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={formOpen} onOpenChange={handleFormDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "New Event"}
            </DialogTitle>
          </DialogHeader>
          <CalendarEventForm
            key={editingEvent?.id ?? `new-${formDefaults.title ?? ""}`}
            event={editingEvent ?? undefined}
            eventType={eventType}
            setEventType={setEventType}
            defaultStartDate={selectedDate}
            defaultTitle={formDefaults.title}
            defaultDescription={formDefaults.description}
            loading={loading}
            setLoading={setLoading}
            onSuccess={() => handleFormDialogChange(false)}
          />
        </DialogContent>
      </Dialog>

      <CalendarEventDetailDialog
        event={selectedEvent}
        isStudent={isStudent}
        loading={loading}
        onClose={() => setSelectedEvent(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}
