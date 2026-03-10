import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { AvatarBadge } from "@/components/AvatarBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { getUserById } from "@/data/mockData";
import type { Task } from "@/types";
import { calculateTaskProgress } from "@/types";
import { Calendar } from "lucide-react";

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    const navigate = useNavigate();
    const pic = getUserById(task.picId);
    const progress = calculateTaskProgress(task);

    return (
        <Card
            className="cursor-pointer animate-fade-in transition-all hover:shadow-md"
            onClick={() => navigate(`/tasks/${task.id}`)}
        >
            <CardContent className="p-4 tv:p-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate tv:text-tv-base">{task.name}</h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{task.dueDate}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {pic && <AvatarBadge user={pic} size="sm" />}
                        <StatusBadge status={task.status} />
                    </div>
                </div>
                <ProgressBar value={progress} size="sm" className="mt-3" />
            </CardContent>
        </Card>
    );
}
