import { cn } from "@/lib/utils";

interface ProgressBarProps {
    value: number;
    showLabel?: boolean;
    size?: "sm" | "md";
    className?: string;
}

export function ProgressBar({ value, showLabel = true, size = "md", className }: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));
    const barColor =
        clampedValue === 100
            ? "bg-success"
            : clampedValue >= 50
                ? "bg-primary"
                : clampedValue > 0
                    ? "bg-warning"
                    : "bg-muted-foreground/30";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div
                className={cn(
                    "flex-1 overflow-hidden rounded-full bg-muted",
                    size === "sm" ? "h-1.5" : "h-2.5"
                )}
            >
                <div
                    className={cn("h-full rounded-full transition-all duration-500", barColor)}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
            {showLabel && (
                <span className="min-w-[3ch] text-right text-xs font-medium text-muted-foreground">
                    {clampedValue}%
                </span>
            )}
        </div>
    );
}
