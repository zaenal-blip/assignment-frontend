import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { TaskCard } from "@/components/TaskCard";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ModalForm } from "@/components/ModalForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectById, getUsers, createTask } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUser } from "@/hooks/use-user";

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: currentUser } = useUser();
    const isManager = currentUser && ["Leader", "SPV", "DPH", "Yang punya TMMIN"].includes(currentUser.role);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [taskName, setTaskName] = useState("");
    const [picId, setPicId] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [checklistItems, setChecklistItems] = useState<string[]>([""]);

    const { data: project, isLoading } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProjectById(projectId || ""),
        enabled: !!projectId,
    });

    const { data: users = [] } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const taskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            toast.success("Task created successfully!");
            setModalOpen(false);
            setTaskName("");
            setPicId("");
            setDueDate(undefined);
            setChecklistItems([""]);
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create task");
        }
    });

    if (isLoading) return <div className="text-center py-10">Loading project details...</div>;
    if (!project) return <div className="text-center py-10">Project not found</div>;

    const projectTasks = project.tasks || [];
    const totalActivities = projectTasks.reduce((acc, t) => acc + t.checklist.length, 0);
    const completedActivities = projectTasks.reduce((acc, t) => acc + t.checklist.filter(c => c.completed).length, 0);
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
    
    const owner = users.find(u => String(u.id) === String(project.ownerId));

    const addChecklistItem = () => setChecklistItems([...checklistItems, ""]);
    const removeChecklistItem = (index: number) => {
        if (checklistItems.length > 1) {
            setChecklistItems(checklistItems.filter((_, i) => i !== index));
        }
    };
    const updateChecklistItem = (index: number, value: string) => {
        const updated = [...checklistItems];
        updated[index] = value;
        setChecklistItems(updated);
    };

    const handleCreateTask = () => {
        if (!taskName) return toast.error("Task name is required");
        if (!picId) return toast.error("PIC is required");

        const filteredActivities = checklistItems.filter(item => item.trim() !== "");

        taskMutation.mutate({
            name: taskName,
            picId: Number(picId),
            sourceType: "PROJECT",
            projectId,
            dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
            activities: filteredActivities
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        try {
            return format(new Date(dateStr), "MMM dd, yyyy");
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up px-2 pb-10">
            <Button 
                variant="ghost" 
                onClick={() => navigate("/projects")} 
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all w-fit"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Projects</span>
            </Button>

            <div className="glass p-8 lg:p-12 rounded-[2.5rem] border-none relative overflow-hidden">
                {/* Decorative blob inside the panel */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-extrabold text-white font-display tracking-tight text-glow leading-tight">
                                {project.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <StatusBadge 
                                    status={project.status} 
                                    className={cn(
                                        "px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border border-white/10 shadow-inner",
                                        project.status === "Active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                        project.status === "Completed" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                        "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                    )}
                                />
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-3 border-l border-white/10">
                                    Project ID: #{project.id.toString().padStart(4, '0')}
                                </span>
                            </div>
                        </div>

                        <p className="text-base text-white/60 leading-relaxed font-medium">
                            {project.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-8 pt-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Timeline</p>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-3.5 w-3.5 text-cyan-400/60" />
                                    <span className="text-sm font-bold text-white/80">
                                        {formatDate(project.startDate)} — {formatDate(project.endDate)}
                                    </span>
                                </div>
                            </div>

                            {owner && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Project Lead</p>
                                    <div className="flex items-center gap-3">
                                        <AvatarBadge user={owner} size="sm" className="ring-2 ring-white/10" />
                                        <span className="text-sm font-bold text-white/80">{owner.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:w-72 space-y-4">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-inner space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Health</p>
                                    <h3 className="text-3xl font-black text-white text-glow">{progress}%</h3>
                                </div>
                                <div className="text-[10px] font-bold text-cyan-400/60 uppercase text-right">
                                    {completedActivities}/{totalActivities} <br/> Activities
                                </div>
                            </div>
                            
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <p className="text-[10px] font-bold text-white/20 text-center uppercase tracking-[0.1em]">
                                Project Completion Progress
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 shadow-inner">
                        <Plus className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-xl font-bold text-white font-display tracking-tight">Tasks Queue</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            {projectTasks.length} Identified Operations
                        </p>
                    </div>
                </div>

                {isManager && (
                    <Button 
                        onClick={() => setModalOpen(true)} 
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl h-12 px-8 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Initialize Task
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>

            <ModalForm open={modalOpen} onOpenChange={setModalOpen} title="Initialize New Task">
                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Mission Objective</Label>
                        <Input 
                            value={taskName} 
                            onChange={(e) => setTaskName(e.target.value)} 
                            placeholder="Enter task objective..." 
                            className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Assign Operator</Label>
                            <Select value={picId} onValueChange={setPicId}>
                                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white hover:bg-white/10 transition-colors">
                                    <SelectValue placeholder="Select PIC" />
                                </SelectTrigger>
                                <SelectContent className="glass-darker border-white/10 text-white backdrop-blur-3xl">
                                    {users.filter(u => u.status === "Active" && u.role !== "Yang punya TMMIN").map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)} className="focus:bg-cyan-500/20 focus:text-white cursor-pointer">{u.name} ({u.role})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Deadline Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all",
                                            !dueDate && "text-white/20"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                                        {dueDate ? format(dueDate, "PPP") : "Pick due date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 glass-darker border-white/10 text-white backdrop-blur-3xl" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                        className="text-white"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Operation Checklist</Label>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                            {checklistItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 animate-fade-in group/item">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-cyan-400 group-hover/item:border-cyan-500/50 transition-colors shadow-inner">
                                        {index + 1}
                                    </div>
                                    <Input
                                        placeholder={`Activity protocol ${index + 1}`}
                                        value={item}
                                        onChange={(e) => updateChecklistItem(index, e.target.value)}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all font-medium"
                                    />
                                    {checklistItems.length > 1 && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeChecklistItem(index)} 
                                            className="shrink-0 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl h-12 w-12 border border-transparent hover:border-rose-500/20 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={addChecklistItem} 
                            className="w-full h-12 rounded-xl bg-white/5 border-dashed border-white/20 text-white/40 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all gap-2 group/add"
                        >
                            <Plus className="h-4 w-4 group-hover/add:rotate-90 transition-transform" /> Add Protocol Step
                        </Button>
                    </div>
                    <Button 
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 border border-white/10 cyan-glow" 
                        onClick={handleCreateTask}
                        disabled={taskMutation.isPending}
                    >
                        {taskMutation.isPending ? (
                            <div className="flex items-center gap-3">
                                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                <span>Initializing...</span>
                            </div>
                        ) : "Finalize Mission Protocol"}
                    </Button>
                </div>
            </ModalForm>
        </div>
    );
}
