import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { AvatarBadge } from "@/components/AvatarBadge";
import { getUserById, getEventTasks } from "@/data/mockData";
import type { Event } from "@/types";
import { calculateEventProgress } from "@/types";

interface EventCardProps {
    event: Event;
    compact?: boolean;
}

export function EventCard({ event, compact }: EventCardProps) {
    const navigate = useNavigate();
    const pic = getUserById(event.picId);
    const eventTasks = getEventTasks(event.id);
    const progress = calculateEventProgress(eventTasks);

    if (compact) {
        return (
            <button
                onClick={() => navigate(`/events/${event.id}`)}
                className="w-full rounded-md bg-primary/10 px-2 py-1 text-left text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 truncate"
            >
                {event.name}
            </button>
        );
    }

    return (
        <Card
            className="cursor-pointer animate-fade-in transition-all hover:shadow-md"
            onClick={() => navigate(`/events/${event.id}`)}
        >
            <CardContent className="p-4 tv:p-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate tv:text-tv-base">{event.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{eventTasks.length} tasks</p>
                    </div>
                    {pic && <AvatarBadge user={pic} size="sm" />}
                </div>
                <ProgressBar value={progress} size="sm" className="mt-3" />
            </CardContent>
        </Card>
    );
}
