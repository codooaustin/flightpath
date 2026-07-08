"use client";

import { useRef, useState } from "react";
import { removeAvatar, uploadAvatar } from "@/lib/actions/profile";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types/models";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileAvatarUploadProps {
  profile: Profile;
}

export function ProfileAvatarUpload({ profile }: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setLoading(true);
    try {
      const result = await uploadAvatar(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setAvatarUrl(result.avatarUrl ?? avatarUrl);
        toast.success("Profile photo updated");
      }
    } catch {
      toast.error("Upload failed. Try a smaller image.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      const result = await removeAvatar();
      if (result?.error) {
        toast.error(result.error);
      } else {
        setAvatarUrl(null);
        toast.success("Profile photo removed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <ProfileAvatar
        profile={{ name: profile.name, avatar_url: avatarUrl }}
        size="lg"
        className="size-16"
      />
      <div className="space-y-2">
        <Label>Profile photo</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" />
            {avatarUrl ? "Change photo" : "Upload photo"}
          </Button>
          {avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={handleRemove}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, or GIF up to 2 MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
