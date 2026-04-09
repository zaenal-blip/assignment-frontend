import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ChecklistItemComponent } from "@/components/ChecklistItemComponent";
import { calculatePersonalJobProgress } from "@/types";
import { ArrowLeft, Calendar, Flag, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPersonalJobById, updateTaskActivity, getUsers } from "@/lib/api";

export default function PersonalJobDetailPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: job, isLoading } = useQuery({
        queryKey: ["personal-job", jobId],
        queryFn: () => getPersonalJobById(jobId || ""),
        enabled: !!jobId,
    });

    const { data: usersList = [] } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const toggleMutation = useMutation({
        mutationFn: ({ activityId, completed }: { activityId: string; completed: boolean }) =>
            updateTaskActivity(jobId || "", activityId, completed),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personal-job", jobId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update item.");
        }
    });

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading job details...</div>;
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg text-muted-foreground">Job not found.</p>
                <Button variant="outline" onClick={() => navigate("/personal-job")} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
            </div>
        );
    }

    const pic = usersList.find(u => String(u.id) === String(job.picId));
    const progress = calculatePersonalJobProgress(job);

    const toggleChecklist = (activityId: string) => {
        const item = job.checklist.find(c => c.id === activityId);
        if (item) {
            toggleMutation.mutate({ activityId, completed: !item.completed });
        }
    };

    const priorityColor = (p: string) => {
        if (p === "High" || p === "HIGH") return "text-destructive";
        if (p === "Medium" || p === "MEDIUM") return "text-warning";
        return "text-muted-foreground";
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate("/personal-job")} className="min-h-[44px]">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Jobs
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-xl tv:text-tv-xl">{job.name}</CardTitle>
                            {job.description && (
                                <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                            )}
                        </div>
                        <StatusBadge status={job.status} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground text-xs">Source</p>
                                <p className="font-medium">{job.source}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground text-xs">Due Date</p>
                                <p className="font-medium">{job.dueDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground text-xs">Priority</p>
                                <p className={`font-medium ${priorityColor(job.priority)}`}>{job.priority}</p>
                            </div>
                        </div>
                        {pic && (
                            <div className="flex items-center gap-2">
                                <AvatarBadge user={pic} size="sm" />
                                <div>
                                    <p className="text-muted-foreground text-xs">PIC</p>
                                    <p className="font-medium">{pic.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <ProgressBar value={progress} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base tv:text-tv-base">Checklist Activities</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {job.checklist.map((item) => (
                            <ChecklistItemComponent key={item.id} item={item} onToggle={toggleChecklist} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
