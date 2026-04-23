import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, Search, Eye, Trash2, Clock, CheckCircle, Hexagon, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ModalForm } from "@/components/ModalForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRegularActivities,
  getRegularTasksToday,
  createRegularJob,
  deleteRegularJob,
  updateRegularJobStatus,
  getUsers,
  getStoredUser,
} from "@/lib/api";

const ITEMS_PER_PAGE = 5;

const categories = ["Safety", "Quality", "Productivity", "Cost", "HR"];
const frequencies = ["Daily", "Weekly", "Monthly"];

export default function RegularActivityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = getStoredUser();

  // Data Fetching
  const { data: regularJobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["regular-jobs"],
    queryFn: getRegularActivities,
  });

  const { data: todayTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["regular-tasks-today"],
    queryFn: getRegularTasksToday,
  });

  const { data: usersList = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: createRegularJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regular-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["regular-tasks-today"] });
      toast.success("Regular activity created successfully!");
      setCreateOpen(false);
      resetForm();
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to create activity"),
  });

  const deleteJobMutation = useMutation({
    mutationFn: deleteRegularJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regular-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["regular-tasks-today"] });
      toast.success("Activity deleted");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ jobId, isDone }: { jobId: string; isDone: boolean }) =>
      updateRegularJobStatus(jobId, isDone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regular-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["regular-tasks-today"] });
      toast.success("Activity marked as Done!");
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to update status"),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Safety");
  const [formFrequency, setFormFrequency] = useState("Daily");
  const [formPic, setFormPic] = useState(currentUser?.id || "");
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("09:00");
  const [formPriority, setFormPriority] = useState("Low");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);


  const isLeaderOrUp =
    currentUser && ["Leader", "SPV", "DPH", "Yang punya TMMIN"].includes(currentUser.role);

  const filtered = useMemo(() => {
    return regularJobs
      .filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || a.status === statusFilter;
        const matchCategory =
          categoryFilter === "all" || a.category === categoryFilter;
        return matchSearch && matchStatus && matchCategory;
      })
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [regularJobs, search, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleCreate = () => {
    if (!formName.trim() || !formStartTime || !formEndTime) {
      toast.error("Please fill in all standard fields.");
      return;
    }
    createJobMutation.mutate({
      name: formName.trim(),
      category: formCategory,
      frequency: formFrequency,
      priority: formPriority,
      picId: Number(formPic),
      startTime: formStartTime,
      endTime: formEndTime,
    });
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJobToDelete(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      deleteJobMutation.mutate(jobToDelete);
      setDeleteOpen(false);
      setJobToDelete(null);
    }
  };

  const handleDone = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    statusMutation.mutate({ jobId: id, isDone: true });
  };

  const resetForm = () => {
    setFormName("");
    setFormCategory("Safety");
    setFormFrequency("Daily");
    setFormStartTime("08:00");
    setFormEndTime("09:00");
    setFormPriority("Low");
    if (currentUser) setFormPic(currentUser.id);
  };

  if (loadingJobs || loadingTasks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading activities...
      </div>
    );
  }

  const todayActivities = todayTasks.sort((a, b) =>
    (a.startTime || "").localeCompare(b.startTime || ""),
  );

  return (
    <div className="space-y-8 animate-fade-in-up px-2 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display text-glow">
            Regular Protocols
          </h1>
          <p className="text-sm text-white/40 font-medium tracking-wide uppercase">
            Sustained operations and daily synthesis
          </p>
        </div>

        <Button 
          onClick={() => setCreateOpen(true)} 
          className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold rounded-2xl h-11 px-6 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-5 w-5 mr-2" />
          Initialize Protocol
        </Button>
      </div>

      {/* Today's Timeline Board */}
      {todayActivities.length > 0 && (
        <div className="glass p-6 md:p-8 rounded-[2rem] border-none relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shadow-inner">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display tracking-tight uppercase tracking-[0.1em]">
                Live Mission Timeline
              </h3>
            </div>

            <div className="flex items-start gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide">
              {todayActivities.map((a, i) => {
                const pic = usersList.find((u) => String(u.id) === String(a.picId));
                const isDone = a.status === "Completed";
                return (
                  <div key={a.id} className="relative flex flex-col min-w-[280px] group">
                    {/* Timeline Line Connector */}
                    {i < todayActivities.length - 1 && (
                      <div className={cn(
                        "absolute top-[22px] left-[44px] w-[calc(100%+1.5rem)] h-[2px] z-0",
                        isDone ? "bg-gradient-to-r from-emerald-500 via-emerald-500/50 to-white/10" : "bg-white/10"
                      )} />
                    )}

                    {/* Timeline Node */}
                    <div className="relative z-10 flex items-center gap-4 mb-6">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                        isDone 
                          ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-110" 
                          : "bg-white/5 border-white/10"
                      )}>
                        {isDone ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-white/20 animate-pulse" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 w-fit">
                          {a.startTime}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Card */}
                    <div 
                      className={cn(
                        "relative p-5 rounded-[2rem] border transition-all duration-500 group-hover:scale-[1.02]",
                        isDone 
                          ? "bg-emerald-500/5 border-emerald-500/20" 
                          : "bg-white/5 border-white/10"
                      )}
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Zap className="h-12 w-12 text-emerald-400" />
                      </div>
                      
                      <div className="relative space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className={cn(
                            "font-bold text-lg font-display tracking-tight transition-colors",
                            isDone ? "text-emerald-400" : "text-white"
                          )}>
                            {a.name}
                          </h4>
                          <StatusBadge status={a.status} className="scale-75 origin-right" />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            {pic && <AvatarBadge user={pic} size="sm" className="ring-1 ring-white/10" />}
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">PIC</span>
                              <span className="text-[10px] font-bold text-white/60 truncate max-w-[100px]">
                                {pic?.name}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Priority</span>
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              a.priority === "High" ? "text-rose-400" :
                              a.priority === "Medium" ? "text-amber-400" :
                              "text-cyan-400"
                            )}>
                              {a.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Board Filter & Content */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 px-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
            <Input
              placeholder="Search active protocols..."
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1);}}
              className="h-11 bg-white/5 border-white/10 rounded-2xl pl-10 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/30"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={(v) => {setCategoryFilter(v); setPage(1);}}>
              <SelectTrigger className="w-[160px] h-11 bg-white/5 border-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="glass-darker border-white/10 text-white">
                <SelectItem value="all">All Sectors</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => {setStatusFilter(v); setPage(1);}}>
              <SelectTrigger className="w-[160px] h-11 bg-white/5 border-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="glass-darker border-white/10 text-white">
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Global Protocol List */}
        <div className="space-y-4">
          <div className="hidden lg:grid grid-cols-[1.5fr_1fr_0.8fr_1fr_1.2fr_0.8fr_0.8fr_auto] gap-4 px-8 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
            <div>Protocol Name</div>
            <div>Sector</div>
            <div>Frequency</div>
            <div>Operator</div>
            <div>Operational Window</div>
            <div>Priority</div>
            <div>Status</div>
            <div></div>
          </div>

          <div className="space-y-4">
            {paginated.length === 0 ? (
              <div className="glass p-12 rounded-[2rem] text-center border-none">
                <Hexagon className="h-12 w-12 text-white/5 mx-auto mb-4" />
                <p className="text-white/20 font-bold uppercase tracking-widest">No matching protocols identified</p>
              </div>
            ) : (
              paginated.map((a) => {
                const pic = usersList.find((u) => String(u.id) === String(a.picId));
                const isCompleted = a.status === "Completed";
                return (
                  <div 
                    key={a.id}
                    className="glass hover:bg-white/[0.08] p-4 lg:px-8 lg:py-5 rounded-[2rem] border-none transition-all duration-300 hover:scale-[1.01] hover:emerald-glow group"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_0.8fr_1fr_1.2fr_0.8fr_0.8fr_auto] items-center gap-4 lg:gap-6">
                      <div className="space-y-1">
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors font-display tracking-tight leading-tight">
                          {a.name}
                        </h4>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">PROP-#{a.id.toString().padStart(4, '0')}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3 text-emerald-400/40" />
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{a.category}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-lg w-fit flex items-center gap-1.5">
                          {a.frequency}
                          <Zap className="h-2.5 w-2.5 text-emerald-400/60 animate-pulse" />
                        </div>
                        <p className="text-[8px] text-white/20 font-bold uppercase tracking-tighter pl-1">
                          Auto-reset {a.frequency.toLowerCase()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {pic && <AvatarBadge user={pic} size="sm" className="ring-2 ring-white/5" />}
                        <span className="text-sm font-semibold text-white/70">{pic?.name || "Unknown"}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Active Hours</p>
                        <span className="text-xs font-bold text-white/80 font-mono tracking-tighter">
                          {a.startTime} – {a.endTime}
                        </span>
                      </div>

                      <div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/5 shadow-inner",
                          a.priority === "High" ? "bg-rose-500/20 text-rose-400 border-rose-500/20" :
                          a.priority === "Medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/20" :
                          "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                        )}>
                          {a.priority}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <StatusBadge status={a.status} className="scale-90 origin-left" />
                        {isCompleted && a.frequency === "Daily" && (
                          <span className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-widest pl-1">
                            Done today
                          </span>
                        )}
                      </div>

                      <div className="flex lg:justify-end items-center gap-3">
                        {!isCompleted && (
                          <button 
                            onClick={(e) => handleDone(a.id, e)}
                            disabled={statusMutation.isPending}
                            className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-30"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleDelete(a.id, e)}
                          className="p-2.5 rounded-xl bg-rose-500/5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination Glass */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 pt-4 pb-10">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2.5 rounded-xl glass hover:bg-white/[0.08] disabled:opacity-20 text-white/50 transition-all"
            >
              Previous Sector
            </button>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">
              Quadrant {page} / {totalPages}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2.5 rounded-xl glass hover:bg-white/[0.08] disabled:opacity-20 text-white/50 transition-all"
            >
              Next Sector
            </button>
          </div>
        )}
      </div>

      {/* Redesigned Modal Form */}
      <ModalForm open={createOpen} onOpenChange={setCreateOpen} title="Initialize Regular Protocol">
        <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
          <div className="space-y-3">
            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 opacity-80 ml-1">Protocol Identifier</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Daily Synthesis Operation"
              className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all px-4"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 opacity-80 ml-1">Assigned Sector</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white hover:bg-white/10 transition-colors"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-darker border-white/10 text-white backdrop-blur-3xl">
                  {categories.map((c) => <SelectItem key={c} value={c} className="focus:bg-emerald-500/20 focus:text-white cursor-pointer">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 opacity-80 ml-1">Cycle Frequency</Label>
              <Select value={formFrequency} onValueChange={setFormFrequency}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white hover:bg-white/10 transition-colors"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-darker border-white/10 text-white backdrop-blur-3xl">
                  {frequencies.map((f) => <SelectItem key={f} value={f} className="focus:bg-emerald-500/20 focus:text-white cursor-pointer">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 opacity-80 ml-1">Initiation Window</Label>
              <Input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl h-12 text-white [color-scheme:dark] focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all font-mono"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 opacity-80 ml-1">Completion Window</Label>
              <Input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl h-12 text-white [color-scheme:dark] focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 opacity-80 ml-1">Operational Priority</Label>
              <Select value={formPriority} onValueChange={setFormPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white hover:bg-white/10 transition-colors"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-darker border-white/10 text-white backdrop-blur-3xl">
                  {["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p} className="focus:bg-emerald-500/20 focus:text-white cursor-pointer">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 opacity-80 ml-1">Lead Operator (PIC)</Label>
              <Select value={formPic} onValueChange={setFormPic} disabled={!isLeaderOrUp}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white hover:bg-white/10 transition-colors"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-darker border-white/10 text-white backdrop-blur-3xl">
                  {usersList.filter((u) => u.role !== "Yang punya TMMIN").map((u) => (
                    <SelectItem key={u.id} value={String(u.id)} className="focus:bg-emerald-500/20 focus:text-white cursor-pointer">{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-500 to-emerald-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 border border-white/10 emerald-glow"
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending ? (
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Constructing...</span>
              </div>
            ) : "Finalize Protocol Initialization"}
          </Button>
        </div>
      </ModalForm>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Terminate Regular Protocol"
        description="Are you sure you want to permanently terminate this protocol sequence? This operation is irreversible."
        confirmText="Terminate Protocol"
        variant="destructive"
      />
    </div>
  );
}
