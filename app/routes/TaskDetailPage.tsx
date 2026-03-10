import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ChecklistItemComponent } from "@/components/ChecklistItemComponent";
import { tasks, events, getUserById } from "@/data/mockData";
import { calculateTaskProgress, type Task } from "@/types";

export default function TaskDetailPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const originalTask = tasks.find((t) => t.id === taskId);

    const [task, setTask] = useState<Task>(
        originalTask
            ? { ...originalTask, checklist: originalTask.checklist.map((c) => ({ ...c })) }
            : { id: "", name: "", eventId: "", picId: "", dueDate: "", checklist: [], status: "Not Started" }
    );

    if (!originalTask) return <div className="text-center py-10">Task not found</div>;
    const progress = calculateTaskProgress(task);
    const pic = getUserById(task.picId);
    const event = events.find((e) => e.id === task.eventId);

    const toggleChecklist = (id: string) => {
        setTask((prev) => ({
            ...prev,
            checklist: prev.checklist.map((c) =>
                c.id === id ? { ...c, completed: !c.completed } : c
            ),
        }));
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="min-h-[44px]">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            <Card>
                <CardContent className="p-6 tv:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Event: {event?.name}</p>
                            <h2 className="text-xl font-bold tv:text-tv-xl">{task.name}</h2>
                            <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={task.status} />
                            {pic && (
                                <div className="flex items-center gap-2">
                                    <AvatarBadge user={pic} size="sm" />
                                    <span className="text-sm">{pic.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <ProgressBar value={progress} className="mt-4" />
                </CardContent>
            </Card>

            <div>
                <h3 className="text-lg font-semibold mb-3 tv:text-tv-lg">Checklist Activities</h3>
                <div className="space-y-2">
                    {task.checklist.map((item) => (
                        <ChecklistItemComponent key={item.id} item={item} onToggle={toggleChecklist} />
                    ))}
                </div>
            </div>
        </div>
    );
}
