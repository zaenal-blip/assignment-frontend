import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    accent?: string;
}

export function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
    return (
        <Card className="animate-fade-in transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5 tv:p-8">
                <div
                    className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg tv:h-16 tv:w-16",
                        accent || "bg-primary/10"
                    )}
                >
                    <Icon className={cn("h-6 w-6 tv:h-8 tv:w-8", accent ? "text-card" : "text-primary")} />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground tv:text-tv-sm">{label}</p>
                    <p className="text-2xl font-bold text-foreground tv:text-tv-2xl">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
