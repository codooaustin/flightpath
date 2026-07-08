import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/models";

function getInitials(name: string | null | undefined) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?"
  );
}

interface ProfileAvatarProps {
  profile: Pick<Profile, "name" | "avatar_url"> | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ProfileAvatar({
  profile,
  size = "default",
  className,
}: ProfileAvatarProps) {
  return (
    <Avatar size={size} className={cn(className)}>
      {profile?.avatar_url ? (
        <AvatarImage src={profile.avatar_url} alt={profile.name ?? "Profile"} />
      ) : null}
      <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
    </Avatar>
  );
}
