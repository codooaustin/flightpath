"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
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
import { HangarEmptyState } from "@/components/hangar/hangar-empty-state";
import { HangarFileDetailDialog } from "@/components/hangar/hangar-file-detail-dialog";
import { HangarFileForm } from "@/components/hangar/hangar-file-form";
import { HangarHero } from "@/components/hangar/hangar-hero";
import { deleteFile } from "@/lib/actions/hangar";
import { getCurrentStage, getNextActionableMission } from "@/lib/calculations/progress";
import { getHangarGuidanceResources } from "@/lib/data/hangar-guidance";
import { getStageResources } from "@/lib/data/stage-guidance";
import {
  fileCategoryBadgeClass,
  getFileDisplayTitle,
  isImageFile,
} from "@/lib/hangar/file-styles";
import {
  getMissionUploadSuggestion,
  type HangarUploadTemplate,
} from "@/lib/hangar/upload-templates";
import { FILE_CATEGORY_LABELS } from "@/types/models";
import type {
  FileCategory,
  HangarFile,
  Mission,
  Stage,
  UserMission,
} from "@/types/models";
import { cn } from "@/lib/utils";
import { FileIcon, Plus, Search } from "lucide-react";
import { toast } from "sonner";

type CategoryFilter = "all" | FileCategory;
type SortOption = "newest" | "oldest" | "name";

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...(Object.keys(FILE_CATEGORY_LABELS) as FileCategory[]).map((category) => ({
    value: category,
    label: FILE_CATEGORY_LABELS[category],
  })),
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
];

interface HangarContentProps {
  files: HangarFile[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  stages: Stage[];
  birthDate: string | null;
  isStudent: boolean;
  initialCategory?: CategoryFilter;
  initialOpenFileId?: string | null;
  initialOpenNew?: boolean;
}

function HangarFileCard({
  file,
  onSelect,
}: {
  file: HangarFile;
  onSelect: (file: HangarFile) => void;
}) {
  const showImage = isImageFile(file);

  return (
    <button
      type="button"
      onClick={() => onSelect(file)}
      className="flex w-full flex-col overflow-hidden rounded-lg border text-left transition-colors hover:bg-muted/40"
    >
      {showImage ? (
        <div className="flex aspect-video items-center justify-center overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.file_url}
            alt={getFileDisplayTitle(file)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-muted">
          <FileIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-medium leading-snug line-clamp-2">
            {getFileDisplayTitle(file)}
          </p>
          <Badge
            variant="outline"
            className={cn("shrink-0 font-normal", fileCategoryBadgeClass(file.category))}
          >
            {FILE_CATEGORY_LABELS[file.category]}
          </Badge>
        </div>
        {file.description && file.description !== getFileDisplayTitle(file) && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {file.file_name}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {format(new Date(file.created_at), "MMM d, yyyy")}
        </p>
      </div>
    </button>
  );
}

export function HangarContent({
  files,
  missions,
  userMissions,
  stages,
  birthDate,
  isStudent,
  initialCategory = "all",
  initialOpenFileId,
  initialOpenNew = false,
}: HangarContentProps) {
  const searchParams = useSearchParams();
  const currentStage = getCurrentStage(stages, missions, userMissions);
  const nextMission = getNextActionableMission(
    userMissions,
    missions,
    birthDate,
    stages
  );
  const missionSuggestion = getMissionUploadSuggestion(
    nextMission?.mission?.title
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedFile, setSelectedFile] = useState<HangarFile | null>(null);
  const [formOpen, setFormOpen] = useState(initialOpenNew);
  const [editingFile, setEditingFile] = useState<HangarFile | null>(null);
  const [formCategory, setFormCategory] = useState<FileCategory>("photos");
  const [defaultDescription, setDefaultDescription] = useState<string>();
  const [loading, setLoading] = useState(false);

  const hangarResources = getHangarGuidanceResources();
  const stageResources = currentStage
    ? getStageResources(currentStage.name)
    : [];
  const supplementalFaaResources = hangarResources.filter(
    (resource) =>
      !stageResources.some(
        (existing) => existing.milestoneId === resource.milestoneId
      )
  );

  const categoryCounts = useMemo(() => {
    const counts = Object.keys(FILE_CATEGORY_LABELS).reduce(
      (acc, key) => {
        acc[key as FileCategory] = 0;
        return acc;
      },
      {} as Record<FileCategory, number>
    );
    for (const file of files) {
      counts[file.category] += 1;
    }
    return counts;
  }, [files]);

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = files;

    if (categoryFilter !== "all") {
      result = result.filter((file) => file.category === categoryFilter);
    }

    if (query) {
      result = result.filter(
        (file) =>
          file.file_name.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return getFileDisplayTitle(a).localeCompare(getFileDisplayTitle(b));
      }
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortBy === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [files, categoryFilter, searchQuery, sortBy]);

  useEffect(() => {
    if (initialOpenFileId) {
      const file = files.find((item) => item.id === initialOpenFileId);
      if (file) setSelectedFile(file);
    }
  }, [initialOpenFileId, files]);

  useEffect(() => {
    const category = searchParams.get("category") as CategoryFilter | null;
    if (category && CATEGORY_FILTERS.some((item) => item.value === category)) {
      setCategoryFilter(category);
    }
  }, [searchParams]);

  function openUploadForm(
    category: FileCategory = "photos",
    description?: string
  ) {
    setEditingFile(null);
    setFormCategory(category);
    setDefaultDescription(description);
    setFormOpen(true);
  }

  function handleUseTemplate(template: HangarUploadTemplate) {
    openUploadForm(template.category, template.description);
  }

  function handleEdit(file: HangarFile) {
    setSelectedFile(null);
    setEditingFile(file);
    setFormCategory(file.category);
    setDefaultDescription(undefined);
    setFormOpen(true);
  }

  async function handleDelete(file: HangarFile) {
    if (
      !window.confirm(
        `Delete "${getFileDisplayTitle(file)}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await deleteFile(file.id);
    setLoading(false);

    if (result?.error) toast.error(result.error);
    else {
      toast.success("File deleted");
      setSelectedFile(null);
    }
  }

  function handleFormSuccess() {
    setFormOpen(false);
    setEditingFile(null);
    setDefaultDescription(undefined);
  }

  const showEmptyState = filteredFiles.length === 0;
  const emptyCategory = categoryFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hangar</h1>
          <p className="text-muted-foreground">
            Your digital aviation storage
          </p>
        </div>
        <DashboardFaaMobileButton
          resources={stageResources}
          supplemental={supplementalFaaResources}
        />
      </div>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <HangarHero
            files={files}
            categoryCounts={categoryCounts}
            isStudent={isStudent}
            onUpload={() => openUploadForm()}
          />

          <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((filter) => {
              const count =
                filter.value === "all"
                  ? files.length
                  : categoryCounts[filter.value];
              return (
                <Button
                  key={filter.value}
                  variant={
                    categoryFilter === filter.value ? "secondary" : "outline"
                  }
                  size="sm"
                  onClick={() => setCategoryFilter(filter.value)}
                >
                  {filter.label}
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1.5 font-normal">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {showEmptyState ? (
            searchQuery ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No files match your search.
              </p>
            ) : (
              <HangarEmptyState
                category={emptyCategory}
                isStudent={isStudent}
                missionSuggestion={missionSuggestion}
                onUseTemplate={handleUseTemplate}
                onUpload={() => openUploadForm()}
              />
            )
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredFiles.map((file) => (
                <HangarFileCard
                  key={file.id}
                  file={file}
                  onSelect={setSelectedFile}
                />
              ))}
            </div>
          )}
          </div>
        </div>

        <DashboardFaaSidebar
          resources={stageResources}
          supplemental={supplementalFaaResources}
          defaultOpen
          storageKey="flightpath-hangar-faa-sidebar"
        />
      </div>

      {isStudent && (
        <Button
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg lg:hidden"
          size="icon"
          onClick={() => openUploadForm()}
          aria-label="Upload file"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <HangarFileDetailDialog
        file={selectedFile}
        isStudent={isStudent}
        loading={loading}
        onClose={() => setSelectedFile(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFile ? "Edit file" : "Upload to Hangar"}
            </DialogTitle>
          </DialogHeader>
          <HangarFileForm
            file={editingFile ?? undefined}
            category={formCategory}
            setCategory={setFormCategory}
            defaultDescription={defaultDescription}
            loading={loading}
            setLoading={setLoading}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
