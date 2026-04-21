import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeft, CheckCircle2, Clock, Shield, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
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
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up px-2 pb-12">
            {/* Back Navigation */}
            <div className="px-2">
                <Button 
                    variant="ghost" 
                    onClick={handleBack} 
                    className="glass border-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl px-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> 
                    Back to Sector
                </Button>
            </div>

            {/* Task Hero Card */}
            <div className="glass p-8 md:p-10 rounded-[2.5rem] border-none relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative space-y-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                                    task.priority === "High" ? "bg-rose-500/20 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]" :
                                    task.priority === "Medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/20" :
                                    "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                )}>
                                    {task.priority || "Standard"} Priority
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    OBJECTIVE-#{task.id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight text-glow uppercase leading-tight">
                                {task.name}
                            </h2>

                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                <div className="flex items-center gap-2 group">
                                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-cyan-400 transition-colors">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Deadline</span>
                                        <span className="text-sm font-bold text-white/80">{formatDate(task.dueDate)}</span>
                                    </div>
                                </div>

                                {task.startTime && (
                                    <div className="flex items-center gap-2 group border-l border-white/5 pl-6">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-cyan-400 transition-colors">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Operational window</span>
                                            <span className="text-sm font-bold text-white/80">{task.startTime} - {task.endTime}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-6 text-right">
                            <StatusBadge status={task.status} className="scale-110 origin-right" />
                            {pic && (
                                <div className="flex items-center gap-4 glass-darker px-5 py-3 rounded-2xl border-white/10">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Operator</p>
                                        <p className="text-sm font-bold text-white">{pic.name}</p>
                                    </div>
                                    <AvatarBadge user={pic} size="md" className="ring-2 ring-white/10" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <div className="flex justify-between items-end mb-4">
                            <div className="space-y-1">
                                <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Operational Integrity</h4>
                                <p className="text-xs font-bold text-cyan-400/60 uppercase">Protocol completion status</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-white text-glow">{Math.round(progress)}%</span>
                            </div>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Grid */}
            <div className="glass p-8 md:p-10 rounded-[2.5rem] border-none relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-10 opacity-[0.03]">
                    <Shield className="h-48 w-48 text-white" />
                </div>
                
                <div className="relative space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white font-display tracking-tight uppercase flex items-center gap-3">
                                <Target className="h-5 w-5 text-cyan-400" />
                                Mission Checklist
                            </h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Verification of sub-protocols</p>
                        </div>
                        <div className="glass-darker px-4 py-2 rounded-xl border-white/10">
                            <span className="text-xs font-black text-white">
                                {task.checklist.filter(c => c.completed).length} <span className="text-white/30">/</span> {task.checklist.length}
                            </span>
                        </div>
                    </div>
                    
                    {task.checklist.length === 0 ? (
                        <div className="text-center py-16 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/10">
                            <Shield className="h-12 w-12 text-white/5 mx-auto mb-4" />
                            <p className="text-white/20 font-bold uppercase tracking-widest">No sub-protocols defined</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {task.checklist.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleToggle(item.id, !item.completed)}
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 border cursor-pointer group",
                                        item.completed 
                                            ? "bg-emerald-500/5 border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]" 
                                            : "bg-white/5 border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.08]"
                                    )}
                                >
                                    <div className={cn(
                                        "h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all",
                                        item.completed 
                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                            : "bg-transparent border-white/10 group-hover:border-cyan-500/50"
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
                                        <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
