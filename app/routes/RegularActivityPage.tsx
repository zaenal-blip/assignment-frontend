import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Eye, Pencil, Trash2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { Badge } from "@/components/ui/badge";
import { ModalForm } from "@/components/ModalForm";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { regularActivities, getUserById, users } from "@/data/mockData";
import {
    type RegularActivity,
    type RegularActivityCategory,
    type RegularActivityFrequency,
} from "@/types";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 5;

const categories: RegularActivityCategory[] = ["Safety", "Quality", "Maintenance", "5S", "Environment"];
const frequencies: RegularActivityFrequency[] = ["Daily", "Weekly", "Monthly"];

function hasTimeOverlap(
    date: string,
    startTime: string,
    endTime: string,
    picId: string,
    activities: RegularActivity[],
    excludeId?: string
): RegularActivity | null {
    return activities.find((a) => {
        if (a.id === excludeId) return false;
        if (a.picId !== picId || a.date !== date) return false;
        return a.startTime < endTime && a.endTime > startTime;
    }) || null;
}

export default function RegularActivityPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [activityList, setActivityList] = useState<RegularActivity[]>(
        regularActivities.map((a) => ({ ...a, checklist: a.checklist.map((c) => ({ ...c })) }))
    );

    // Create form state
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState<RegularActivityCategory>("Safety");
    const [formFrequency, setFormFrequency] = useState<RegularActivityFrequency>("Daily");
    const [formPic, setFormPic] = useState(users[0].id);
    const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
    const [formStartTime, setFormStartTime] = useState("08:00");
    const [formEndTime, setFormEndTime] = useState("09:00");

    const overlapWarning = useMemo(() => {
        if (!formDate || !formStartTime || !formEndTime || !formPic) return null;
        return hasTimeOverlap(formDate, formStartTime, formEndTime, formPic, activityList);
    }, [formDate, formStartTime, formEndTime, formPic, activityList]);

    const filtered = useMemo(() => {
        return activityList.filter((a) => {
            const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === "all" || a.status === statusFilter;
            const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
            return matchSearch && matchStatus && matchCategory;
        });
    }, [activityList, search, statusFilter, categoryFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Check for schedule conflicts per activity
    const getConflict = (activity: RegularActivity) => {
        return hasTimeOverlap(activity.date, activity.startTime, activity.endTime, activity.picId, activityList, activity.id);
    };

    const handleCreate = () => {
        if (!formName.trim()) {
            toast.error("Activity name is required");
            return;
        }
        if (formStartTime >= formEndTime) {
            toast.error("End time must be after start time");
            return;
        }
        const newActivity: RegularActivity = {
            id: `ra-${Date.now()}`,
            name: formName.trim(),
            category: formCategory,
            frequency: formFrequency,
            picId: formPic,
            date: formDate,
            startTime: formStartTime,
            endTime: formEndTime,
            lastUpdate: new Date().toISOString().split("T")[0],
            status: "Pending",
            checklist: [],
        };
        setActivityList((prev) => [newActivity, ...prev]);
        setFormName("");
        setFormStartTime("08:00");
        setFormEndTime("09:00");
        setCreateOpen(false);
        toast.success("Activity created successfully!");
    };

    const handleDelete = (id: string) => {
        setActivityList((prev) => prev.filter((a) => a.id !== id));
        toast.success("Activity deleted");
    };

    // Timeline for today
    const todayStr = new Date().toISOString().split("T")[0];
    const todayActivities = activityList
        .filter((a) => a.date === todayStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold tv:text-tv-xl">Regular Activity</h2>
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
                                const pic = getUserById(a.picId);
                                const conflict = getConflict(a);
                                return (
                                    <div key={a.id} className="relative pb-4 last:pb-0">
                                        {/* Timeline line */}
                                        {i < todayActivities.length - 1 && (
                                            <div className="absolute left-[-16px] top-3 bottom-0 w-px bg-border" />
                                        )}
                                        {/* Timeline dot */}
                                        <div className={`absolute left-[-20px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${conflict ? "border-destructive bg-destructive/20" : "border-primary bg-primary/20"
                                            }`} />
                                        <div
                                            className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors hover:bg-accent/50"
                                            onClick={() => navigate(`/regular-activity/${a.id}`)}
                                        >
                                            <span className="text-sm font-mono text-muted-foreground whitespace-nowrap">
                                                {a.startTime} – {a.endTime}
                                            </span>
                                            <span className="text-sm font-medium truncate">{a.name}</span>
                                            {pic && <AvatarBadge user={pic} size="sm" />}
                                            <StatusBadge status={a.status} />
                                            {conflict && (
                                                <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px]">
                                                    <AlertTriangle className="h-3 w-3 mr-0.5" /> Conflict
                                                </Badge>
                                            )}
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
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 min-h-[44px]"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[160px] min-h-[44px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[160px] min-h-[44px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
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
                                    <TableHead>Date</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>End Time</TableHead>
                                    <TableHead>PIC</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No activities found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginated.map((a) => {
                                        const pic = getUserById(a.picId);
                                        const conflict = getConflict(a);
                                        return (
                                            <TableRow key={a.id}>
                                                <TableCell className="font-medium tv:text-tv-sm">
                                                    <div className="flex items-center gap-2">
                                                        {a.name}
                                                        {conflict && (
                                                            <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px]">
                                                                <AlertTriangle className="h-3 w-3 mr-0.5" /> Conflict
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                                                        {a.category}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{a.date}</TableCell>
                                                <TableCell className="text-sm font-mono">{a.startTime}</TableCell>
                                                <TableCell className="text-sm font-mono">{a.endTime}</TableCell>
                                                <TableCell>
                                                    {pic && <AvatarBadge user={pic} size="sm" />}
                                                </TableCell>
                                                <TableCell><StatusBadge status={a.status} /></TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(`/regular-activity/${a.id}`)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast.info("Edit modal (UI demo)")}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => handleDelete(a.id)}>
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
                    <p className="text-center py-8 text-muted-foreground">No activities found.</p>
                ) : (
                    paginated.map((a) => {
                        const pic = getUserById(a.picId);
                        const conflict = getConflict(a);
                        return (
                            <Card key={a.id} className="animate-fade-in">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">{a.name}</p>
                                            <p className="text-xs text-muted-foreground">{a.category} · {a.frequency}</p>
                                        </div>
                                        <StatusBadge status={a.status} />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>{a.date}</span>
                                        <span className="font-mono">{a.startTime} – {a.endTime}</span>
                                    </div>
                                    {conflict && (
                                        <Badge className="bg-warning/15 text-warning border-warning/30 text-xs">
                                            <AlertTriangle className="h-3 w-3 mr-1" /> Schedule Conflict
                                        </Badge>
                                    )}
                                    <div className="flex items-center justify-between">
                                        {pic && <AvatarBadge user={pic} size="sm" />}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 min-h-[44px]" onClick={() => navigate(`/regular-activity/${a.id}`)}>
                                            <Eye className="h-4 w-4 mr-1" /> View
                                        </Button>
                                        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => toast.info("Edit modal (UI demo)")}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="min-h-[44px] text-destructive" onClick={() => handleDelete(a.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-[44px]">
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="min-h-[44px]">
                        Next
                    </Button>
                </div>
            )}

            {/* Create Modal */}
            <ModalForm open={createOpen} onOpenChange={setCreateOpen} title="Create Regular Activity">
                <div className="space-y-4">
                    <div>
                        <Label>Activity Name</Label>
                        <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Daily Safety Patrol" className="mt-1 min-h-[44px]" />
                    </div>
                    <div>
                        <Label>Category</Label>
                        <Select value={formCategory} onValueChange={(v) => setFormCategory(v as RegularActivityCategory)}>
                            <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Frequency</Label>
                        <Select value={formFrequency} onValueChange={(v) => setFormFrequency(v as RegularActivityFrequency)}>
                            <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {frequencies.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="mt-1 min-h-[44px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Start Time</Label>
                            <Input type="time" value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} className="mt-1 min-h-[44px]" />
                        </div>
                        <div>
                            <Label>End Time</Label>
                            <Input type="time" value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)} className="mt-1 min-h-[44px]" />
                        </div>
                    </div>

                    {/* Overlap Warning */}
                    {overlapWarning && (
                        <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 space-y-1">
                            <div className="flex items-center gap-2 text-warning font-medium text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                Schedule Conflict Detected
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {getUserById(formPic)?.name} already has another activity scheduled:
                            </p>
                            <p className="text-sm font-medium">{overlapWarning.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {overlapWarning.startTime} – {overlapWarning.endTime}
                            </p>
                            <p className="text-xs text-muted-foreground">Please choose another time.</p>
                        </div>
                    )}

                    <div>
                        <Label>PIC</Label>
                        <Select value={formPic} onValueChange={setFormPic}>
                            <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {users.filter((u) => u.status === "Active").map((u) => (
                                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleCreate} className="w-full min-h-[44px]">Create Activity</Button>
                </div>
            </ModalForm>
        </div>
    );
}
