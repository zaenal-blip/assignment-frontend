import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Filter } from "lucide-react";
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
import { getProjects, getTasks, getUsers } from "@/lib/api";
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

    if (isMobile) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Projects</h2>
                    <Button onClick={() => setModalOpen(true)} size="sm" className="min-h-[44px]">
                        <Plus className="h-4 w-4 mr-1" /> Create
                    </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                        <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Deadlines</SelectItem>
                            <SelectItem value="Ending Soon">Ending Soon</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {projectsData.map((project) => {
                    const badge = getDeadlineBadge(project.endDate, project.status);
                    return (
                        <Card key={project.id} className="cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-semibold">{project.name}</h3>
                                    <StatusBadge status={project.status} />
                                </div>
                                <p className="text-xs text-muted-foreground">Owner: {project.ownerName}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(project.startDate)} — {formatDate(project.endDate)}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">{project.tasks.length} tasks</p>
                                    {badge && <Badge className={badge.className}>{badge.label}</Badge>}
                                </div>
                                <ProgressBar value={project.progress} size="sm" />
                            </CardContent>
                        </Card>
                    );
                })}
                <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tv:text-tv-xl">Projects</h2>
                <Button onClick={() => setModalOpen(true)} className="min-h-[44px]">
                    <Plus className="h-4 w-4 mr-1" /> Create Project
                </Button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                    <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Owners</SelectItem>
                        {owners.map((owner) => (
                            <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                    <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Deadlines</SelectItem>
                        <SelectItem value="Ending Soon">Ending Soon</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Tasks</TableHead>
                                <TableHead className="w-[140px]">Progress</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projectsData.map((project) => {
                                const badge = getDeadlineBadge(project.endDate, project.status);
                                return (
                                    <TableRow key={project.id} className="cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                                        <TableCell className="font-medium tv:text-tv-sm">{project.name}</TableCell>
                                        <TableCell className="tv:text-tv-sm">{project.ownerName}</TableCell>
                                        <TableCell className="text-sm">{formatDate(project.startDate)}</TableCell>
                                        <TableCell className="text-sm">{formatDate(project.endDate)}</TableCell>
                                        <TableCell>{project.tasks.length}</TableCell>
                                        <TableCell><ProgressBar value={project.progress} size="sm" /></TableCell>
                                        <TableCell><StatusBadge status={project.status} /></TableCell>
                                        <TableCell>
                                            {badge && <Badge className={badge.className}>{badge.label}</Badge>}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`); }}>
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
        </div>
    );
}

function CreateProjectModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const { data: users = [] } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });

    return (
        <ModalForm open={open} onOpenChange={onOpenChange} title="Create Project">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input placeholder="Enter project name" />
                </div>
                <div className="space-y-2">
                    <Label>Owner</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                        <SelectContent>
                            {users.filter((u) => ["Leader", "SPV", "DPH"].includes(u.role)).map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : "Pick date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : "Pick date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Input placeholder="Enter description" />
                </div>
                <Button className="w-full min-h-[44px]" onClick={() => onOpenChange(false)}>
                    Create Project
                </Button>
            </div>
        </ModalForm>
    );
}
