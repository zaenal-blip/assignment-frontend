import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ChecklistItemComponent } from "@/components/ChecklistItemComponent";
import { getRegularActivityById, getUserById } from "@/data/mockData";
import { calculateRegularActivityProgress, type RegularActivity } from "@/types";
import { toast } from "sonner";

export default function RegularActivityDetailPage() {
    const { activityId } = useParams();
    const navigate = useNavigate();
    const original = getRegularActivityById(activityId || "");

    const [activity, setActivity] = useState<RegularActivity | null>(
        original ? { ...original, checklist: original.checklist.map((c) => ({ ...c })) } : null
    );

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

    const pic = getUserById(activity.picId);
    const progress = calculateRegularActivityProgress(activity);

    const toggleChecklist = (checklistId: string) => {
        setActivity((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                checklist: prev.checklist.map((c) =>
                    c.id === checklistId ? { ...c, completed: !c.completed } : c
                ),
            };
        });
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