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
        <Card className="glass group overflow-hidden border-none transition-all duration-300 hover:scale-[1.02] hover:cyan-glow">
            <CardContent className="flex items-center gap-4 p-5 tv:p-8">
                <div
                    className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-[10deg] tv:h-20 tv:w-20",
                        accent ? "bg-white/10" : "bg-cyan-500/10"
                    )}
                >
                    <Icon className={cn("h-7 w-7 tv:h-10 tv:w-10", accent ? "text-white" : "text-cyan-400")} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-white/50 tv:text-tv-sm mb-0.5">
                        {label}
                    </p>
                    <p className="text-3xl font-bold text-white tv:text-tv-3xl tracking-tight">
                        {value}
                    </p>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/5 blur-2xl pointer-events-none group-hover:bg-cyan-400/10 transition-colors" />
            </CardContent>
        </Card>
    );
}
