import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Filter, Search, ArrowRight, LayoutGrid, List as ListIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { Badge } from "@/components/ui/badge";
import { ModalForm } from "@/components/ModalForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getProjects, getTasks, getUsers, createProject } from "@/lib/api";
import type { Project, Task, User } from "@/types";

function getDeadlineBadge(endDate: string, status: string) {
    if (status === "Completed") return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Overdue", className: "bg-destructive/15 text-destructive border-destructive/30" };
    if (diff <= 3) return { label: "Deadline Soon", className: "bg-destructive/15 text-destructive border-destructive/30" };
    if (diff <= 7) return { label: "Due Soon", className: "bg-warning/15 text-warning border-warning/30" };
    return { label: "On Track", className: "bg-success/15 text-success border-success/30" };
}

export default function ProjectsPage() {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [modalOpen, setModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [ownerFilter, setOwnerFilter] = useState<string>("All");
    const [deadlineFilter, setDeadlineFilter] = useState<string>("All");

    const { data: projects = [] } = useQuery<Project[]>({ queryKey: ["projects"], queryFn: getProjects });
    const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["project-tasks"], queryFn: () => getTasks("PROJECT") });
    const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });

    const projectsData = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const data = projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const totalChecklist = projectTasks.reduce((sum, task) => sum + task.checklist.length, 0);
            const completedChecklist = projectTasks.reduce(
                (sum, task) => sum + task.checklist.filter((item) => item.completed).length,
                0
            );
            const progress = totalChecklist === 0 ? 0 : Math.round((completedChecklist / totalChecklist) * 100);
            const owner = users.find((user) => user.id === project.ownerId);
            return {
                ...project,
                tasks: projectTasks,
                progress,
                ownerName: owner?.name || "",
            };
        });

        return data
            .filter((project) => statusFilter === "All" || project.status === statusFilter)
            .filter((project) => ownerFilter === "All" || project.ownerId === ownerFilter)
            .filter((project) => {
                if (deadlineFilter !== "Ending Soon") return true;
                const end = new Date(project.endDate);
                const soon = new Date(now);
                soon.setDate(soon.getDate() + 7);
                return end <= soon && project.status !== "Completed";
            })
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    }, [projects, tasks, users, statusFilter, ownerFilter, deadlineFilter]);

    const owners = useMemo(
        () => users.map((user) => ({ id: user.id, name: user.name })),
        [users]
    );

    const formatDate = (d: string) => {
        try {
            return format(new Date(d), "MMM dd, yyyy");
        } catch {
            return d;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up px-2 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white font-display text-glow">
                        Projects
                    </h1>
                    <p className="text-sm text-white/40 font-medium tracking-wide uppercase">
                        Manage and track your industrial assets
                    </p>
                </div>

                <div className="flex flex-1 max-w-md mx-auto w-full md:mx-0">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-cyan-400" />
                        <Input
                            placeholder="Search projects by name..."
                            className="h-11 w-full bg-white/5 backdrop-blur-md pl-10 text-white border-white/10 rounded-2xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>

                <Button 
                    onClick={() => setModalOpen(true)} 
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl h-11 px-6 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Project
                </Button>
            </div>

            {/* Filter Section */}
            <div className="glass p-5 rounded-3xl border-none flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 mr-2">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shadow-inner">
                        <Filter className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Filters</span>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-full bg-white/5 border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="glass-darker border-white/10 text-white">
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                    <SelectTrigger className="w-[170px] h-10 rounded-full bg-white/5 border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors">
                        <SelectValue placeholder="All Owners" />
                    </SelectTrigger>
                    <SelectContent className="glass-darker border-white/10 text-white">
                        <SelectItem value="All">All Owners</SelectItem>
                        {owners.map((owner) => (
                            <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                    <SelectTrigger className="w-[160px] h-10 rounded-full bg-white/5 border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors">
                        <SelectValue placeholder="All Deadlines" />
                    </SelectTrigger>
                    <SelectContent className="glass-darker border-white/10 text-white">
                        <SelectItem value="All">All Deadlines</SelectItem>
                        <SelectItem value="Ending Soon">Ending Soon</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Projects List (Modern Card Table) */}
            <div className="space-y-4">
                {/* Desktop Header */}
                <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1.5fr_1fr_auto] gap-4 px-8 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                    <div>Project Name</div>
                    <div>Owner</div>
                    <div>Duration</div>
                    <div className="text-center">Tasks</div>
                    <div>Progress</div>
                    <div>Status</div>
                    <div></div>
                </div>

                <div className="space-y-4">
                    {projectsData.map((project) => {
                        const deadline = getDeadlineBadge(project.endDate, project.status);
                        const owner = users.find(u => u.id === project.ownerId);

                        return (
                            <div 
                                key={project.id}
                                onClick={() => navigate(`/projects/${project.id}`)}
                                className="glass hover:bg-white/[0.08] p-4 lg:px-8 lg:py-5 rounded-3xl border-none transition-all duration-300 hover:scale-[1.01] hover:cyan-glow cursor-pointer group"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1fr_1.5fr_1fr_auto] items-center gap-4 lg:gap-6">
                                    {/* Name */}
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-white text-base font-display tracking-tight group-hover:text-cyan-400 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold flex items-center gap-2">
                                            ID: #{project.id.toString().padStart(4, '0')}
                                            {deadline && (
                                                <span className={cn("px-2 py-0.5 rounded-full border", deadline.className)}>
                                                    {deadline.label}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Owner */}
                                    <div className="flex items-center gap-3">
                                        {owner && <AvatarBadge user={owner} size="sm" className="ring-2 ring-white/10 group-hover:ring-cyan-500/50 transition-all" />}
                                        <span className="text-sm font-semibold text-white/80">{project.ownerName}</span>
                                    </div>

                                    {/* Dates */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white/70">{formatDate(project.endDate)}</span>
                                        <span className="text-[10px] text-white/30 uppercase font-semibold">Deadline</span>
                                    </div>

                                    {/* Tasks */}
                                    <div className="flex lg:justify-center">
                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white">
                                            {project.tasks.length} Tasks
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-2 min-w-[120px]">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-white/40 uppercase">Completion</span>
                                            <span className="text-cyan-400">{project.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                            <div 
                                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <StatusBadge 
                                            status={project.status} 
                                            className={cn(
                                                "px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest border border-white/10 shadow-inner",
                                                project.status === "Active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                                project.status === "Completed" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                                "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                            )}
                                        />
                                    </div>

                                    {/* Action */}
                                    <div className="flex lg:justify-end">
                                        <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                                            <ArrowRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
        </div>
    );
}

function CreateProjectModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [description, setDescription] = useState("");
    
    const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });

    const createMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Project created successfully!");
            onOpenChange(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create project");
        }
    });

    const resetForm = () => {
        setName("");
        setOwnerId("");
        setStartDate(undefined);
        setEndDate(undefined);
        setDescription("");
    };

    const handleCreate = () => {
        if (!name || !ownerId || !startDate || !endDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        createMutation.mutate({
            name,
            ownerId: Number(ownerId),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            description
        });
    };

    return (
        <ModalForm open={open} onOpenChange={(v) => {
            onOpenChange(v);
            if (!v) resetForm();
        }} title="Create Project">
            <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
                <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Project Name</Label>
                    <Input 
                        placeholder="Enter project nomenclature..." 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Lead Architect (Owner)</Label>
                    <Select value={ownerId} onValueChange={setOwnerId}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white hover:bg-white/10 transition-colors">
                            <SelectValue placeholder="Select lead owner" />
                        </SelectTrigger>
                        <SelectContent className="glass-darker border-white/10 text-white backdrop-blur-3xl">
                            {users.filter((u) => ["Leader", "SPV", "DPH"].includes(u.role)).map((u) => (
                                <SelectItem key={u.id} value={String(u.id)} className="focus:bg-cyan-500/20 focus:text-white cursor-pointer">{u.name} ({u.role})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Initiation Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all", !startDate && "text-white/20")}>
                                    <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                                    {startDate ? format(startDate, "PPP") : "Pick date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 glass-darker border-white/10 text-white backdrop-blur-3xl" align="start">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 text-white" />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Target Horizon</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all", !endDate && "text-white/20")}>
                                    <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                                    {endDate ? format(endDate, "PPP") : "Pick date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 glass-darker border-white/10 text-white backdrop-blur-3xl" align="start">
                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 text-white" />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Project Brief (optional)</Label>
                    <Input 
                        placeholder="Enter mission parameters..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
                    />
                </div>
                <Button 
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 border border-white/10 cyan-glow" 
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? (
                        <div className="flex items-center gap-3">
                            <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            <span>Synthesizing...</span>
                        </div>
                    ) : "Initialize Project"}
                </Button>
            </div>
        </ModalForm>
    );
}
