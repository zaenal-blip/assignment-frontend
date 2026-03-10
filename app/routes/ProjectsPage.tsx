import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { ModalForm } from "@/components/ModalForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    projects, events, tasks, users, getUserById, getProjectEvents,
} from "@/data/mockData";
import { calculateProjectProgress } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProjectsPage() {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [modalOpen, setModalOpen] = useState(false);

    const projectsData = projects.map((p) => {
        const pEvents = getProjectEvents(p.id);
        const progress = calculateProjectProgress(pEvents, tasks);
        const owner = getUserById(p.ownerId);
        return { ...p, events: pEvents, progress, ownerName: owner?.name || "" };
    });

    // Mobile card layout
    if (isMobile) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Projects</h2>
                    <Button onClick={() => setModalOpen(true)} size="sm" className="min-h-[44px]">
                        <Plus className="h-4 w-4 mr-1" /> Create
                    </Button>
                </div>
                {projectsData.map((p) => (
                    <Card key={p.id} className="cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold">{p.name}</h3>
                                <StatusBadge status={p.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">Owner: {p.ownerName}</p>
                            <p className="text-xs text-muted-foreground">{p.events.length} events</p>
                            <ProgressBar value={p.progress} size="sm" />
                        </CardContent>
                    </Card>
                ))}
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
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Events</TableHead>
                                <TableHead className="w-[140px]">Progress</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projectsData.map((p) => (
                                <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                                    <TableCell className="font-medium tv:text-tv-sm">{p.name}</TableCell>
                                    <TableCell className="tv:text-tv-sm">{p.ownerName}</TableCell>
                                    <TableCell>{p.events.length}</TableCell>
                                    <TableCell><ProgressBar value={p.progress} size="sm" /></TableCell>
                                    <TableCell><StatusBadge status={p.status} /></TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${p.id}`); }}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
        </div>
    );
}

function CreateProjectModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
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
                <Button className="w-full min-h-[44px]" onClick={() => onOpenChange(false)}>
                    Create Project
                </Button>
            </div>
        </ModalForm>
    );
}
