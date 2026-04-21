import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { CreatePersonalJobModal } from "@/components/CreatePersonalJobModal";
import { calculatePersonalJobProgress, type PersonalJob } from "@/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Plus, Search, Send, Eye, Trash2, ArrowRight, Zap } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPersonalJobs, deletePersonalJob, getStoredUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PersonalJobPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const currentUser = getStoredUser();

    const { data: allJobs = [], isLoading } = useQuery({
        queryKey: ["personal-jobs"],
        queryFn: getPersonalJobs,
    });

    const deleteMutation = useMutation({
        mutationFn: deletePersonalJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personal-jobs"] });
            toast.success("Job deleted.");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete job.");
        }
    });

    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<string | null>(null);

    const filteredJobs = useMemo(() => {
        let jobs = [...allJobs];
        if (search) {
            const q = search.toLowerCase();
            jobs = jobs.filter((j) => j.name.toLowerCase().includes(q));
        }
        if (sourceFilter !== "All") jobs = jobs.filter((j) => j.source === sourceFilter);
        if (statusFilter !== "All") jobs = jobs.filter((j) => j.status === statusFilter);
        return jobs;
    }, [allJobs, search, sourceFilter, statusFilter]);

    const handleCreateSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["personal-jobs"] });
    };

    const handleDelete = (jobId: string) => {
        setJobToDelete(jobId);
        setDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (jobToDelete) {
            deleteMutation.mutate(jobToDelete);
            setDeleteOpen(false);
            setJobToDelete(null);
        }
    };

    const submitProgress = () => toast.success("Progress submitted successfully!");

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading jobs...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in-up px-2 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-white font-display text-glow">
                        My Missions
                    </h1>
                    <p className="text-sm text-white/40 font-medium tracking-wide uppercase">
                        Operator <span className="text-cyan-400">{currentUser?.name}</span> • Sector Performance Log
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setCreateOpen(true)} 
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold rounded-2xl h-11 px-6 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Mission
                    </Button>
                    <Button 
                        onClick={submitProgress} 
                        variant="outline" 
                        className="glass border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl h-11 px-6 transition-all"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Push Sync
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 px-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                    <Input 
                        placeholder="Search assigned protocols..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="h-11 bg-white/5 border-white/10 rounded-2xl pl-10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/30"
                    />
                </div>
                
                <div className="flex gap-3">
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-[160px] h-11 bg-white/5 border-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-darker border-white/10 text-white">
                            <SelectItem value="All">All Sources</SelectItem>
                            <SelectItem value="Assigned">Assigned</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] h-11 bg-white/5 border-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-darker border-white/10 text-white">
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Not Started">Standby</SelectItem>
                            <SelectItem value="In Progress">Active</SelectItem>
                            <SelectItem value="Completed">Synchronized</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Mission Cards Grid */}
            <div className="space-y-4">
                {/* Desktop Header */}
                <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_2fr_1.2fr_auto] gap-4 px-8 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                    <div>Mission Descriptor</div>
                    <div>Origin</div>
                    <div>Target Date</div>
                    <div>Priority</div>
                    <div>Integrity / Progress</div>
                    <div>State</div>
                    <div></div>
                </div>

                <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                        <div className="glass p-12 rounded-[2rem] text-center border-none">
                            <Zap className="h-12 w-12 text-white/5 mx-auto mb-4" />
                            <p className="text-white/20 font-bold uppercase tracking-widest">No active protocols identified</p>
                        </div>
                    ) : (
                        filteredJobs.map((job) => {
                            const progress = calculatePersonalJobProgress(job);
                            return (
                                <div 
                                    key={job.id}
                                    onClick={() => navigate(`/personal-job/${job.id}`)}
                                    className="glass hover:bg-white/[0.08] p-4 lg:px-8 lg:py-5 rounded-[2rem] border-none transition-all duration-300 hover:scale-[1.01] hover:blue-glow group cursor-pointer"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_2fr_1.2fr_auto] items-center gap-4 lg:gap-6">
                                        {/* Name */}
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors font-display tracking-tight leading-tight">
                                                {job.name}
                                            </h4>
                                            <p className="text-[10px] text-white/20 uppercase tracking-widest">TASK-#{job.id.toString().slice(-4)}</p>
                                        </div>

                                        {/* Source */}
                                        <div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/5 shadow-inner",
                                                job.source === "Assigned" ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/20" : "bg-white/5 text-white/40 border-white/5"
                                            )}>
                                                {job.source}
                                            </span>
                                        </div>

                                        {/* Due Date */}
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/20 uppercase tracking-widest">Expiration</p>
                                            <span className="text-xs font-bold text-white/70">{job.dueDate}</span>
                                        </div>

                                        {/* Priority */}
                                        <div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/5 shadow-inner",
                                                job.priority === "High" ? "bg-rose-500/20 text-rose-400 border-rose-500/20" :
                                                job.priority === "Medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/20" :
                                                "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                                            )}>
                                                {job.priority}
                                            </span>
                                        </div>

                                        {/* Progress */}
                                        <div className="space-y-3 pr-4">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Integrity</span>
                                                <span className="text-xs font-black text-white text-glow">{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <StatusBadge status={job.status} className="scale-90 origin-left" />

                                        {/* Action */}
                                        <div className="flex lg:justify-end items-center gap-3">
                                            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                                                <ArrowRight className="h-5 w-5" />
                                            </button>
                                            {job.source === "Personal" && (
                                                <button 
                                                    onClick={(e) => {e.stopPropagation(); handleDelete(job.id);}}
                                                    className="p-2.5 rounded-xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <CreatePersonalJobModal 
                open={createOpen} 
                onOpenChange={setCreateOpen} 
                onSuccess={handleCreateSuccess} 
            />

            <ConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={confirmDelete}
                title="Terminate Mission Sequence"
                description="Are you sure you want to permanently terminate this mission protocol? This operation is irreversible."
                confirmText="Terminate Mission"
                variant="destructive"
            />
        </div>
    );
}
