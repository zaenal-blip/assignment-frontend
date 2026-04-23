import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { AvatarBadge } from "@/components/AvatarBadge";
import { StatusBadge } from "@/components/StatusBadge";
import type { Task, User } from "@/types";
import { calculateTaskProgress } from "@/types";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    const navigate = useNavigate();
    const pic: User = {
        id: task.picId,
        name: "",
        email: "",
        phone: "",
        role: "Member",
        avatar: task.name.charAt(0).toUpperCase(),
        status: "Active",
    };
    const progress = calculateTaskProgress(task);

    return (
        <Card
            className="group glass hover:bg-white/[0.08] cursor-pointer animate-fade-in transition-all duration-300 hover:scale-[1.02] hover:cyan-glow border-none rounded-3xl"
            onClick={() => navigate(`/tasks/${task.id}`)}
        >
            <CardContent className="p-5 tv:p-8 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate tv:text-tv-base font-display tracking-tight">
                            {task.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                            <Calendar className="h-3 w-3 text-cyan-400/60" />
                            <span>{task.dueDate}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {pic && <AvatarBadge user={pic} size="sm" className="ring-2 ring-white/10 group-hover:ring-cyan-500/50 transition-all" />}
                        <StatusBadge 
                            status={task.status} 
                            className={cn(
                                "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                                task.status === "In Progress" ? "bg-emerald-500/20 text-emerald-400" :
                                task.status === "Completed" ? "bg-blue-500/20 text-blue-400" :
                                "bg-rose-500/20 text-rose-400"
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-white/20">Progress</span>
                        <span className="text-cyan-400 text-glow">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[0.5px]">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
