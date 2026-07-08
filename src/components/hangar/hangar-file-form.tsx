"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadFile, updateFile } from "@/lib/actions/hangar";
import { FILE_CATEGORY_LABELS } from "@/types/models";
import type { FileCategory, HangarFile } from "@/types/models";
import { toast } from "sonner";

interface HangarFileFormProps {
  file?: HangarFile;
  category: FileCategory;
  setCategory: (category: FileCategory) => void;
  defaultDescription?: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

export function HangarFileForm({
  file,
  category,
  setCategory,
  defaultDescription,
  loading,
  setLoading,
  onSuccess,
}: HangarFileFormProps) {
  const categories = Object.keys(FILE_CATEGORY_LABELS) as FileCategory[];
  const isEdit = !!file;

  async function handleSubmit(formData: FormData) {
    if (isEdit) {
      setLoading(true);
      try {
        const result = await updateFile(file.id, formData);
        if (result?.error) toast.error(result.error);
        else {
          toast.success("File updated");
          onSuccess();
        }
      } catch {
        toast.error("Failed to update file");
      } finally {
        setLoading(false);
      }
      return;
    }

    const upload = formData.get("file") as File | null;
    const maxBytes = 9 * 1024 * 1024;

    if (upload && upload.size > maxBytes) {
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
        onSuccess();
      }
    } catch {
      toast.error("Upload failed. Try a smaller file or try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {!isEdit && (
        <>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as FileCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category">
                  {FILE_CATEGORY_LABELS[category]}
                </SelectValue>
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
            <p className="text-xs text-muted-foreground">Max file size: 9 MB</p>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">
          {isEdit ? "Description" : "Description (optional)"}
        </Label>
        <Textarea
          id="description"
          name="description"
          key={defaultDescription ?? file?.description ?? "new"}
          defaultValue={defaultDescription ?? file?.description ?? ""}
          placeholder="e.g. Student pilot certificate, discovery flight photos"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {isEdit ? "Save changes" : "Upload"}
      </Button>
    </form>
  );
}
