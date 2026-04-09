import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { calculateTaskProgress } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, getUsers, updateTaskActivity } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TaskDetailPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    // Auto-detect back path conceptually if we came from an event or project
    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate("/projects");
        }
    };

    const { data: task, isLoading } = useQuery({
        queryKey: ["task", taskId],
        queryFn: () => getTaskById(taskId || ""),
        enabled: !!taskId,
    });

    const { data: users = [] } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const toggleMutation = useMutation({
        mutationFn: ({ activityId, isCompleted }: { activityId: string, isCompleted: boolean }) => 
            updateTaskActivity(taskId!, activityId, isCompleted),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task", taskId] });
            // Should also invalidate parent event/project to update progress bars
            if (task?.eventId) queryClient.invalidateQueries({ queryKey: ["event", task.eventId] });
            if (task?.projectId) queryClient.invalidateQueries({ queryKey: ["project", task.projectId] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to update activity");
        }
    });

    if (isLoading) return <div className="text-center py-10">Loading task details...</div>;
    if (!task) return <div className="text-center py-10">Task not found</div>;

    const progress = calculateTaskProgress(task);
    const pic = users.find(u => String(u.id) === String(task.picId));

    const handleToggle = (activityId: string, isCompleted: boolean) => {
        toggleMutation.mutate({ activityId, isCompleted });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "No due date";
        try {
            return format(new Date(dateStr), "MMM dd, yyyy");
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={handleBack} className="min-h-[44px]">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 tv:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2">
                            {task.priority && (
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                                    task.priority === "High" ? "bg-red-100 text-red-700" :
                                    task.priority === "Medium" ? "bg-orange-100 text-orange-700" :
                                    "bg-green-100 text-green-700"
                                }`}>
                                    {task.priority} Priority
                                </span>
                            )}
                            <h2 className="text-xl font-bold tv:text-tv-xl text-foreground/90">{task.name}</h2>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="opacity-70">Due:</span> 
                                <span className="font-medium text-foreground/80">{formatDate(task.dueDate)}</span>
                            </p>
                            {task.startTime && task.endTime && (
                                <p className="text-sm text-muted-foreground">
                                    Time: {task.startTime} - {task.endTime}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <StatusBadge status={task.status} />
                            {pic && (
                                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                                    <AvatarBadge user={pic} size="sm" />
                                    <span className="text-sm font-medium">{pic.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border/50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Completion Progress</span>
                            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                        </div>
                        <ProgressBar value={progress} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm">
                <CardContent className="p-6 tv:p-8">
                    <h3 className="text-lg font-semibold tv:text-tv-lg mb-4 flex items-center gap-2">
                        Checklist Activities
                        <span className="text-muted-foreground text-sm font-normal">
                            ({task.checklist.filter(c => c.completed).length}/{task.checklist.length})
                        </span>
                    </h3>
                    
                    {task.checklist.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/60">
                            No activities defined for this task.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {task.checklist.map((item) => (
                                <div 
                                    key={item.id} 
                                    className={`flex items-start space-x-3 p-4 border rounded-xl transition-all duration-200 ${
                                        item.completed 
                                            ? "bg-primary/5 border-primary/20 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]" 
                                            : "bg-card border-border/60 hover:border-primary/30 hover:bg-muted/10 cursor-pointer"
                                    }`}
                                    onClick={() => handleToggle(item.id, !item.completed)}
                                >
                                    <Checkbox 
                                        id={item.id} 
                                        checked={item.completed} 
                                        onCheckedChange={(checked) => handleToggle(item.id, checked === true)} 
                                        onClick={(e) => e.stopPropagation()}
                                        className={`mt-0.5 min-h-[24px] min-w-[24px] rounded-md ${
                                            item.completed ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary" : ""
                                        }`} 
                                    />
                                    <div className="grid gap-1.5 leading-none cursor-pointer flex-1">
                                        <label
                                            htmlFor={item.id}
                                            className={`text-base leading-snug cursor-pointer select-none transition-colors ${
                                                item.completed ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground font-medium"
                                            }`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {item.label}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
