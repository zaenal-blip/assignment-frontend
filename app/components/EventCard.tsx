import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { AvatarBadge } from "@/components/AvatarBadge";
import type { Event, User, Project } from "@/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
    event: any; // Can be Event or Project (unified by CalendarBoard)
    progress?: number;
    taskCount?: number;
    compact?: boolean;
}

export function EventCard({ event, progress = 0, taskCount = 0, compact }: EventCardProps) {
    const navigate = useNavigate();
    
    // Type detection from CalendarBoard transformation
    const isProject = event.calendarType === "project";
    const typeColor = isProject ? "emerald" : "blue";
    
    const pic: User = { 
        id: event.picId || event.ownerId || "system", 
        name: "", 
        email: "", 
        phone: "", 
        role: "Member", 
        avatar: event.name ? event.name.charAt(0).toUpperCase() : "?", 
        status: "Active" 
    };

    const handleClick = () => {
        if (isProject) {
            navigate(`/projects/${event.id}`);
        } else {
            navigate(`/events/${event.id}`);
        }
    };

    if (compact) {
        return (
            <button
                onClick={handleClick}
                className={cn(
                    "w-full group/card relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/5 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg text-left",
                    isProject ? "hover:emerald-glow hover:bg-emerald-500/[0.05]" : "hover:blue-glow hover:bg-blue-500/[0.05]"
                )}
            >
                {/* Accent Line */}
                <div className={cn(
                    "absolute left-0 top-0 w-1 h-full",
                    isProject ? "bg-emerald-500" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                )} />

                <div className="p-2 pl-3 flex items-center gap-2.5">
                    <AvatarBadge user={pic} size="sm" className="ring-1 ring-white/10 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <h4 className="text-[11px] font-black text-white truncate leading-tight group-hover/card:text-glow">
                            {event.name}
                        </h4>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">
                            {isProject ? "Phase Alpha" : "Event Node"}
                        </p>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <Card
            className={cn(
                "cursor-pointer animate-fade-in transition-all duration-500 hover:scale-[1.01] glass border-none overflow-hidden group",
                isProject ? "hover:emerald-glow" : "hover:blue-glow"
            )}
            onClick={handleClick}
        >
            <CardContent className="p-4 tv:p-6 relative overflow-hidden">
                {/* Visual Accent */}
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20",
                    isProject ? "bg-emerald-500" : "bg-blue-500"
                )} />

                <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-black text-white truncate tv:text-tv-base group-hover:text-glow transition-all">
                            {event.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                isProject ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                            )}>
                                {isProject ? "Project" : "Event"}
                            </span>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                {isProject ? "Protocol Status: ACTIVE" : `${taskCount} Active Tasks`}
                            </p>
                        </div>
                    </div>
                    <AvatarBadge user={pic} size="sm" className="ring-2 ring-white/10 group-hover:ring-white/30 transition-all" />
                </div>
                {!isProject && <ProgressBar value={progress} size="sm" className="mt-4 opacity-80 group-hover:opacity-100" />}
            </CardContent>
        </Card>
    );
}
