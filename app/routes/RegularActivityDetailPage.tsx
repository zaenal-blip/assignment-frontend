import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ChecklistItemComponent } from "@/components/ChecklistItemComponent";
import { calculateRegularActivityProgress } from "@/types";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRegularActivityById, updateTaskActivity, getUsers } from "@/lib/api";

export default function RegularActivityDetailPage() {
    const { activityId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: activity, isLoading } = useQuery({
        queryKey: ["regular-activity", activityId],
        queryFn: () => getRegularActivityById(activityId || ""),
        enabled: !!activityId,
    });

    const { data: usersList = [] } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const toggleMutation = useMutation({
        mutationFn: ({ activityId: checkId, completed }: { activityId: string; completed: boolean }) =>
            updateTaskActivity(activityId || "", checkId, completed),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["regular-activity", activityId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update item.");
        }
    });

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading activity details...</div>;
    }

    if (!activity) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg text-muted-foreground">Activity not found.</p>
                <Button variant="outline" className="mt-4 min-h-[44px]" onClick={() => navigate("/regular-activity")}>
                    Back to Regular Activity
                </Button>
            </div>
        );
    }

    const pic = usersList.find(u => String(u.id) === String(activity.picId));
    const progress = calculateRegularActivityProgress(activity);

    const toggleChecklist = (checklistId: string) => {
        const item = activity.checklist.find(c => c.id === checklistId);
        if (item) {
            toggleMutation.mutate({ activityId: checklistId, completed: !item.completed });
        }
    };

    const submitProgress = () => {
        toast.success("Progress submitted successfully!");
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate("/regular-activity")} className="min-h-[44px] -ml-2">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-lg tv:text-tv-xl">{activity.name}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                                    {activity.category}
                                </span>
                                <span className="text-sm text-muted-foreground">{activity.frequency}</span>
                                <StatusBadge status={activity.status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <span>{activity.date}</span>
                                <span className="font-mono">{activity.startTime} – {activity.endTime}</span>
                            </div>
                        </div>
                        {pic && <AvatarBadge user={pic} />}
                    </div>
                    <ProgressBar value={progress} className="mt-4" />
                </CardHeader>
            </Card>

            {/* Checklist */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base tv:text-tv-base">Checklist Activities</CardTitle>
                </CardHeader>
                <CardContent>
                    {activity.checklist.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No checklist items.</p>
                    ) : (
                        <div className="space-y-2">
                            {activity.checklist.map((item) => (
                                <ChecklistItemComponent
                                    key={item.id}
                                    item={item}
                                    onToggle={toggleChecklist}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Button onClick={submitProgress} className="w-full sm:w-auto min-h-[44px]">
                Submit Progress
            </Button>
        </div>
    );
}