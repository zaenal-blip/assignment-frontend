import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { EventCard } from "@/components/EventCard";
import { ModalForm } from "@/components/ModalForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projects, getProjectEvents, getUserById, users, tasks } from "@/data/mockData";
import { calculateProjectProgress } from "@/types";

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);

    const project = projects.find((p) => p.id === projectId);
    if (!project) return <div className="text-center py-10">Project not found</div>;

    const projectEvents = getProjectEvents(project.id);
    const progress = calculateProjectProgress(projectEvents, tasks);
    const owner = getUserById(project.ownerId);

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate("/projects")} className="min-h-[44px]">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
            </Button>

            <Card>
                <CardContent className="p-6 tv:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold tv:text-tv-xl">{project.name}</h2>
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">Owner: <span className="font-medium text-foreground">{owner?.name}</span></p>
                        </div>
                        <StatusBadge status={project.status} />
                    </div>
                    <ProgressBar value={progress} className="mt-4" />
                </CardContent>
            </Card>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tv:text-tv-lg">Events ({projectEvents.length})</h3>
                <Button onClick={() => setModalOpen(true)} className="min-h-[44px]">
                    <Plus className="h-4 w-4 mr-1" /> Create Event
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 tv:gap-6">
                {projectEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            <ModalForm open={modalOpen} onOpenChange={setModalOpen} title="Create Event">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Event Name</Label>
                        <Input placeholder="Enter event name" />
                    </div>
                    <div className="space-y-2">
                        <Label>Assign PIC</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Select PIC" /></SelectTrigger>
                            <SelectContent>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full min-h-[44px]" onClick={() => setModalOpen(false)}>
                        Create Event
                    </Button>
                </div>
            </ModalForm>
        </div>
    );
}
