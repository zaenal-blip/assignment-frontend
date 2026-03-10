import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, X } from "lucide-react";
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
import { events, getEventTasks, getUserById, users, projects } from "@/data/mockData";
import { calculateEventProgress } from "@/types";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [checklistItems, setChecklistItems] = useState<string[]>([""]);

    const event = events.find((e) => e.id === eventId);
    if (!event) return <div className="text-center py-10">Event not found</div>;

    const eventTasks = getEventTasks(event.id);
    const progress = calculateEventProgress(eventTasks);
    const pic = getUserById(event.picId);
    const project = projects.find((p) => p.id === event.projectId);

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

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="min-h-[44px]">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            <Card>
                <CardContent className="p-6 tv:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Project: {project?.name}</p>
                            <h2 className="text-xl font-bold tv:text-tv-xl">{event.name}</h2>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <p className="text-sm text-muted-foreground">Date: {event.date}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={event.status} />
                            {pic && (
                                <div className="flex items-center gap-2">
                                    <AvatarBadge user={pic} size="sm" />
                                    <span className="text-sm">{pic.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <ProgressBar value={progress} className="mt-4" />
                </CardContent>
            </Card>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tv:text-tv-lg">Tasks ({eventTasks.length})</h3>
                <Button onClick={() => setModalOpen(true)} className="min-h-[44px]">
                    <Plus className="h-4 w-4 mr-1" /> Create Task
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 tv:gap-6">
                {eventTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>

            <ModalForm open={modalOpen} onOpenChange={setModalOpen} title="Create Task">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                        <Label>Task Name</Label>
                        <Input placeholder="Enter task name" />
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
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label>Checklist Activities</Label>
                        {checklistItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    placeholder={`Activity ${index + 1}`}
                                    value={item}
                                    onChange={(e) => updateChecklistItem(index, e.target.value)}
                                />
                                {checklistItems.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeChecklistItem(index)} className="shrink-0">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addChecklistItem} className="min-h-[44px] w-full">
                            <Plus className="h-4 w-4 mr-1" /> Add Activity
                        </Button>
                    </div>
                    <Button className="w-full min-h-[44px]" onClick={() => { setModalOpen(false); setChecklistItems([""]); }}>
                        Create Task
                    </Button>
                </div>
            </ModalForm>
        </div>
    );
}
