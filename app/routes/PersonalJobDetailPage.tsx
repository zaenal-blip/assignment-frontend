import { useParams, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ChecklistItemComponent } from "@/components/ChecklistItemComponent";
import { calculatePersonalJobProgress } from "@/types";
import { ArrowLeft, Calendar, Flag, FileText, Activity, CheckCircle2, Target, Shield, Clock } from "lucide-react";
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
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up px-2 pb-12">
            {/* Back Navigation */}
            <div className="px-2">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate("/personal-job")} 
                    className="glass border-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl px-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> 
                    Return to Log
                </Button>
            </div>

            {/* Mission Hero Card */}
            <div className="glass p-8 md:p-10 rounded-[2.5rem] border-none relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative space-y-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                                    job.priority === "High" ? "bg-rose-500/20 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]" :
                                    job.priority === "Medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/20" :
                                    "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                )}>
                                    {job.priority} Priority
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    PROTOCOL-#{job.id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight text-glow uppercase leading-tight">
                                {job.name}
                            </h2>
                            
                            {job.description && (
                                <p className="text-white/40 text-sm leading-relaxed max-w-2xl font-medium tracking-wide">
                                    {job.description}
                                </p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                                <div className="space-y-2 group">
                                    <div className="flex items-center gap-2 text-white/20">
                                        <Activity className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Origin Sector</span>
                                    </div>
                                    <p className="text-sm font-bold text-white font-display group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{job.source}</p>
                                </div>
                                <div className="space-y-2 group">
                                    <div className="flex items-center gap-2 text-white/20">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Expiration</span>
                                    </div>
                                    <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{job.dueDate}</p>
                                </div>
                                {pic && (
                                    <div className="space-y-2 group">
                                        <div className="flex items-center gap-2 text-white/20">
                                            <Shield className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Identity PIC</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AvatarBadge user={pic} size="sm" className="ring-1 ring-white/10" />
                                            <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{pic.name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <StatusBadge status={job.status} className="scale-110 origin-right" />
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <div className="flex justify-between items-end mb-4">
                            <div className="space-y-1">
                                <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Synchronization Status</h4>
                                <p className="text-xs font-bold text-indigo-400/60 uppercase">Data integrity verified</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-white text-glow">{Math.round(progress)}%</span>
                            </div>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Section */}
            <div className="glass p-8 md:p-10 rounded-[2.5rem] border-none relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-10 opacity-[0.03]">
                    <Target className="h-48 w-48 text-white" />
                </div>
                
                <div className="relative space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white font-display tracking-tight uppercase flex items-center gap-3">
                                <Shield className="h-5 w-5 text-indigo-400" />
                                Protocol Tasks
                            </h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Operational verification sequence</p>
                        </div>
                        <div className="glass-darker px-4 py-2 rounded-xl border-white/10">
                            <span className="text-xs font-black text-white">
                                {job.checklist.filter(c => c.completed).length} <span className="text-white/30">/</span> {job.checklist.length}
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {job.checklist.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => toggleChecklist(item.id)}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 border cursor-pointer group",
                                    item.completed 
                                        ? "bg-indigo-500/5 border-indigo-500/20 shadow-[inset_0_0_15px_rgba(79,70,229,0.05)]" 
                                        : "bg-white/5 border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.08]"
                                )}
                            >
                                <div className={cn(
                                    "h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all",
                                    item.completed 
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                                        : "bg-transparent border-white/10 group-hover:border-indigo-500/50"
                                )}>
                                    {item.completed && <CheckCircle2 className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-bold tracking-tight transition-all",
                                        item.completed ? "text-white/30 line-through" : "text-white/80 group-hover:text-white"
                                    )}>
                                        {item.label}
                                    </p>
                                </div>
                                {item.completed && (
                                    <div className="h-1 w-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,1)]" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
