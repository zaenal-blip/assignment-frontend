import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { Plus, Search, Eye, Trash2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ModalForm } from "@/components/ModalForm";
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

const categories = ["Safety", "Quality", "Maintenance", "5S", "Environment"];
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
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("09:00");

  useEffect(() => {
    if (!formDate) {
      setFormDate(new Date().toISOString().split("T")[0]);
    }
  }, [formDate]);

  const isLeaderOrUp =
    currentUser && ["Leader", "SPV", "DPH"].includes(currentUser.role);

  const filtered = useMemo(() => {
    return regularJobs.filter((a) => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" || a.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [regularJobs, search, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleCreate = () => {
    if (!formName.trim() || !formDate || !formStartTime || !formEndTime) {
      toast.error("Please fill in all standard fields.");
      return;
    }
    createJobMutation.mutate({
      name: formName.trim(),
      category: formCategory,
      frequency: formFrequency,
      picId: Number(formPic),
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
    });
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("Are you sure?")) {
      deleteJobMutation.mutate(id);
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
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStartTime("08:00");
    setFormEndTime("09:00");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tv:text-tv-xl">
          Regular Activity
        </h2>
        <Button onClick={() => setCreateOpen(true)} className="min-h-[44px]">
          <Plus className="h-4 w-4 mr-1" /> Create Activity
        </Button>
      </div>

      {/* Today's Timeline */}
      {todayActivities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base tv:text-tv-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-0">
              {todayActivities.map((a, i) => {
                const pic = usersList.find(
                  (u) => String(u.id) === String(a.picId),
                );
                return (
                  <div key={a.id} className="relative pb-4 last:pb-0">
                    {/* Timeline line */}
                    {i < todayActivities.length - 1 && (
                      <div className="absolute left-[-16px] top-3 bottom-0 w-px bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-[-20px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-primary/20" />
                    <div
                      className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors hover:bg-accent/50"
                      onClick={() => navigate(`/regular-activity/${a.id}`)}
                    >
                      <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">
                        {a.startTime} – {a.endTime}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {a.name}
                      </span>
                      {pic && <AvatarBadge user={pic} size="sm" />}
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 min-h-[44px]"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px] min-h-[44px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px] min-h-[44px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No activities found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((a) => {
                    const pic = usersList.find(
                      (u) => String(u.id) === String(a.picId),
                    );
                    const isCompleted = a.status === "Completed";
                    return (
                      <TableRow key={a.id} className="group">
                        {/* Activity Name */}
                        <TableCell className="font-medium tv:text-tv-sm">
                          {a.name}
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <span className="text-xs font-medium text-muted-foreground">
                            {a.category}
                          </span>
                        </TableCell>

                        {/* Frequency */}
                        <TableCell className="text-sm text-muted-foreground">
                          {a.frequency}
                        </TableCell>

                        {/* PIC */}
                        <TableCell className="tv:text-tv-sm">
                          {pic?.name || "Unknown"}
                        </TableCell>

                        {/* Schedule */}
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {a.date ? format(new Date(a.date), "MMM dd") : "-"} ·{" "}
                          {a.startTime} – {a.endTime}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusBadge status={a.status} />
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            {!isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
                                onClick={(e) => handleDone(a.id, e)}
                                disabled={statusMutation.isPending}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Done
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/5"
                              onClick={(e) => handleDelete(a.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No activities found.
          </p>
        ) : (
          paginated.map((a) => {
            const pic = usersList.find((u) => String(u.id) === String(a.picId));
            const isCompleted = a.status === "Completed";
            return (
              <Card key={a.id} className="animate-fade-in shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-base leading-none">
                        {a.name}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="bg-accent px-2 py-0.5 rounded-full text-accent-foreground font-medium">
                          {a.category}
                        </span>
                        <span className="flex items-center">
                          · {a.frequency}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-3">
                    {pic ? <AvatarBadge user={pic} size="sm" /> : <div />}
                    <div className="flex items-center gap-2">
                      {!isCompleted && (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-9 px-4 bg-success/80 hover:bg-success text-success-foreground"
                          onClick={(e) => handleDone(a.id, e)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1.5" /> Done
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-destructive border-border/50"
                        onClick={(e) => handleDelete(a.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="min-h-[44px]"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="min-h-[44px]"
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <ModalForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Regular Activity"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <Label>Activity Name</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Daily Safety Patrol"
              className="mt-1 min-h-[44px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select
                value={formCategory}
                onValueChange={(v) => setFormCategory(v)}
              >
                <SelectTrigger className="mt-1 min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={formFrequency}
                onValueChange={(v) => setFormFrequency(v)}
              >
                <SelectTrigger className="mt-1 min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SCHEDULE INPUTS */}
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="mt-1 min-h-[44px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <Label>PIC</Label>
            <Select
              value={formPic}
              onValueChange={setFormPic}
              disabled={!isLeaderOrUp}
            >
              <SelectTrigger className="mt-1 min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {usersList.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isLeaderOrUp && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                As a Member, you are automatically assigned as the PIC.
              </p>
            )}
          </div>
          <Button
            onClick={handleCreate}
            className="w-full min-h-[44px]"
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending ? "Creating..." : "Create Activity"}
          </Button>
        </div>
      </ModalForm>
    </div>
  );
}
