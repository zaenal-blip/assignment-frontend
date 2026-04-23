import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface AvatarBadgeProps {
    user: User;
    size?: "sm" | "md" | "lg";
    showRole?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
};

const roleColors: Record<string, string> = {
    Admin: "bg-destructive text-destructive-foreground",
    Leader: "bg-primary text-primary-foreground",
    SPV: "bg-secondary text-secondary-foreground",
    DPH: "bg-warning text-warning-foreground",
    Member: "bg-muted text-muted-foreground",
};

const isUrl = (value: string) =>
    value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");

export function AvatarBadge({ user, size = "md", showRole = false, className }: AvatarBadgeProps) {
    const isImage = user.avatar && isUrl(user.avatar);

    return (
        <div className={cn("relative inline-flex flex-col items-center", className)}>
            <div
                className={cn(
                    "flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground overflow-hidden",
                    sizeClasses[size]
                )}
            >
                {isImage ? (
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    user.avatar
                )}
            </div>
            {showRole && (
                <span
                    className={cn(
                        "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                        roleColors[user.role]
                    )}
                >
                    {user.role}
                </span>
            )}
        </div>
    );
}
