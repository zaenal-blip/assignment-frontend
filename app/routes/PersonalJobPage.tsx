import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AvatarBadge } from "@/components/AvatarBadge";
import { CreatePersonalJobModal } from "@/components/CreatePersonalJobModal";
import {
    currentUser,
    getUserPersonalJobs,
    getUserAssignedJobsAsPersonalJobs,
    getUserById,
} from "@/data/mockData";
import { calculatePersonalJobProgress, type PersonalJob } from "@/types";
import { toast } from "sonner";
import { Plus, Search, Send, Eye, Trash2 } from "lucide-react";
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

export default function PersonalJobPage() {
    const navigate = useNavigate();
    const assignedJobs = getUserAssignedJobsAsPersonalJobs(currentUser.id);
    const [personalJobs, setPersonalJobs] = useState<PersonalJob[]>(getUserPersonalJobs(currentUser.id));
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const allJobs = useMemo(() => {
        let jobs = [...assignedJobs, ...personalJobs];
        if (search) {
            const q = search.toLowerCase();
            jobs = jobs.filter((j) => j.name.toLowerCase().includes(q));
        }
        if (sourceFilter !== "All") jobs = jobs.filter((j) => j.source === sourceFilter);
        if (statusFilter !== "All") jobs = jobs.filter((j) => j.status === statusFilter);
        return jobs;
    }, [assignedJobs, personalJobs, search, sourceFilter, statusFilter]);

    const handleCreate = (job: PersonalJob) => {
        setPersonalJobs((prev) => [...prev, job]);
    };

    const handleDelete = (jobId: string) => {
        setPersonalJobs((prev) => prev.filter((j) => j.id !== jobId));
        toast.success("Job deleted.");
    };

    const submitProgress = () => toast.success("Progress submitted successfully!");

    const priorityColor = (p: string) => {
        if (p === "High") return "text-destructive font-medium";
        if (p === "Medium") return "text-warning font-medium";
        return "text-muted-foreground";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold tv:text-tv-xl">My Jobs</h2>
                    <p className="text-sm text-muted-foreground">
                        Logged in as <span className="font-medium text-foreground">{currentUser.name}</span> ({currentUser.role})
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setCreateOpen(true)} className="min-h-[44px]">
                        <Plus className="h-4 w-4 mr-1" /> Create Job
                    </Button>
                    <Button onClick={submitProgress} variant="outline" className="min-h-[44px]">
                        <Send className="h-4 w-4 mr-1" /> Submit
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Sources</SelectItem>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Desktop Table */}
            <Card className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Name</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No jobs found.</TableCell>
                                </TableRow>
                            ) : (
                                allJobs.map((job) => {
                                    const progress = calculatePersonalJobProgress(job);
                                    return (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-medium">{job.name}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${job.source === "Assigned" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
                                                    {job.source}
                                                </span>
                                            </TableCell>
                                            <TableCell>{job.dueDate}</TableCell>
                                            <TableCell><span className={priorityColor(job.priority)}>{job.priority}</span></TableCell>
                                            <TableCell className="min-w-[120px]"><ProgressBar value={progress} size="sm" /></TableCell>
                                            <TableCell><StatusBadge status={job.status} /></TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/personal-job/${job.id}`)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {job.source === "Personal" && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)} className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {allJobs.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No jobs found.</p>
                ) : (
                    allJobs.map((job) => {
                        const progress = calculatePersonalJobProgress(job);
                        return (
                            <Card key={job.id} className="animate-fade-in" onClick={() => navigate(`/personal-job/${job.id}`)}>
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-sm">{job.name}</p>
                                            <p className="text-xs text-muted-foreground">Due: {job.dueDate}</p>
                                        </div>
                                        <StatusBadge status={job.status} />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded-full ${job.source === "Assigned" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
                                            {job.source}
                                        </span>
                                        <span className={priorityColor(job.priority)}>{job.priority}</span>
                                    </div>
                                    <ProgressBar value={progress} size="sm" />
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <CreatePersonalJobModal open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
        </div>
    );
}
