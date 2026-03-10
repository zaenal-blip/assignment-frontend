import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ChecklistItemComponent } from "@/components/ChecklistItemComponent";
import {
    getPersonalJobById,
    getUserAssignedJobsAsPersonalJobs,
    getUserById,
    currentUser,
} from "@/data/mockData";
import { calculatePersonalJobProgress, type PersonalJob } from "@/types";
import { ArrowLeft, Calendar, Flag, FileText } from "lucide-react";

export default function PersonalJobDetailPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const initialJob = useMemo(() => {
        // Check personal jobs first, then assigned
        let job = getPersonalJobById(jobId || "");
        if (!job) {
            job = getUserAssignedJobsAsPersonalJobs(currentUser.id).find((j) => j.id === jobId);
        }
        return job;
    }, [jobId]);

    const [job, setJob] = useState<PersonalJob | undefined>(
        initialJob ? { ...initialJob, checklist: initialJob.checklist.map((c) => ({ ...c })) } : undefined
    );

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

    const pic = getUserById(job.picId);
    const progress = calculatePersonalJobProgress(job);

    const toggleChecklist = (checklistId: string) => {
        setJob((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                checklist: prev.checklist.map((c) =>
                    c.id === checklistId ? { ...c, completed: !c.completed } : c
                ),
            };
        });
    };

    const priorityColor = (p: string) => {
        if (p === "High") return "text-destructive";
        if (p === "Medium") return "text-warning";
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
