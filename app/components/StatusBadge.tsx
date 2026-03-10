import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusStyles: Record<string, string> = {
    Active: "bg-success/15 text-success",
    Completed: "bg-success/15 text-success",
    "In Progress": "bg-warning/15 text-warning",
    Planned: "bg-primary/15 text-primary",
    "Not Started": "bg-muted text-muted-foreground",
    "On Hold": "bg-destructive/15 text-destructive",
    Inactive: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusStyles[status] || "bg-muted text-muted-foreground",
                className
            )}
        >
            {status}
        </span>
    );
}
