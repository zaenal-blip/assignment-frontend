import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ChecklistItem as ChecklistItemType } from "@/types";

interface ChecklistItemProps {
    item: ChecklistItemType;
    onToggle?: (id: string) => void;
    disabled?: boolean;
}

export function ChecklistItemComponent({ item, onToggle, disabled }: ChecklistItemProps) {
    return (
        <label
            className={cn(
                "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50",
                item.completed && "bg-success/5 border-success/20",
                disabled && "cursor-not-allowed opacity-60"
            )}
        >
            <Checkbox
                checked={item.completed}
                onCheckedChange={() => onToggle?.(item.id)}
                disabled={disabled}
            />
            <span
                className={cn(
                    "text-sm tv:text-tv-sm",
                    item.completed && "text-muted-foreground line-through"
                )}
            >
                {item.label}
            </span>
        </label>
    );
}
