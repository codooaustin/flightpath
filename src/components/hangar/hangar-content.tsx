"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadFile, deleteFile } from "@/lib/actions/hangar";
import { FILE_CATEGORY_LABELS } from "@/types/models";
import type { FileCategory, HangarFile } from "@/types/models";
import { format } from "date-fns";
import { Plus, Trash2, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface HangarContentProps {
  files: HangarFile[];
  isStudent: boolean;
}

export function HangarContent({ files, isStudent }: HangarContentProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FileCategory>("photos");
  const [loading, setLoading] = useState(false);

  const categories = Object.keys(FILE_CATEGORY_LABELS) as FileCategory[];

  async function handleUpload(formData: FormData) {
    const file = formData.get("file") as File | null;
    const maxBytes = 9 * 1024 * 1024;

    if (file && file.size > maxBytes) {
      toast.error("File must be 9 MB or smaller");
      return;
    }

    setLoading(true);
    formData.set("category", category);

    try {
      const result = await uploadFile(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("File uploaded");
        setOpen(false);
      }
    } catch {
      toast.error("Upload failed. Try a smaller file or try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(file: HangarFile) {
    const result = await deleteFile(file.id, file.file_url, file.bucket);
    if (result?.error) toast.error(result.error);
    else toast.success("File deleted");
  }

  function renderFiles(filtered: HangarFile[]) {
    if (filtered.length === 0) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No files in this category yet.
        </p>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((file) => {
          const isImage = file.category === "photos";
          return (
            <Card key={file.id}>
              <CardContent className="p-4">
                {isImage ? (
                  <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-md bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.file_url}
                      alt={file.file_name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex aspect-video items-center justify-center rounded-md bg-muted">
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="truncate font-medium">{file.file_name}</p>
                  {file.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {file.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(file.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-7 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                  >
                    View
                  </a>
                  {isStudent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hangar</h1>
          <p className="text-muted-foreground">
            Your digital aviation storage
          </p>
        </div>
        {isStudent && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload to Hangar</DialogTitle>
              </DialogHeader>
              <form action={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as FileCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {FILE_CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Max file size: 9 MB
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <Button type="submit" disabled={loading}>
                  Upload
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All <Badge variant="secondary" className="ml-1">{files.length}</Badge>
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {FILE_CATEGORY_LABELS[cat]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {renderFiles(files)}
        </TabsContent>
        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            {renderFiles(files.filter((f) => f.category === cat))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
