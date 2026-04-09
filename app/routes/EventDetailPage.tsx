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
import { calculateEventProgress } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventById, getUsers, createTask } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUser } from "@/hooks/use-user";

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [modalOpen, setModalOpen] = useState(false);
    const [taskName, setTaskName] = useState("");
    const [picId, setPicId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [checklistItems, setChecklistItems] = useState<string[]>([""]);

    const { data: event, isLoading } = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => getEventById(eventId || ""),
        enabled: !!eventId,
    });

    const { data: users = [] } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const taskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            toast.success("Task created successfully!");
            setModalOpen(false);
            setTaskName("");
            setPicId("");
            setDueDate("");
            setChecklistItems([""]);
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create task");
        }
    });

    if (isLoading) return <div className="text-center py-10">Loading event details...</div>;
    if (!event) return <div className="text-center py-10">Event not found</div>;

    const eventTasks = event.tasks || [];
    const progress = calculateEventProgress(eventTasks);
    // Find the PIC from users list by ID since event API might not return avatar inside event.pic directly 
    const pic = users.find(u => String(u.id) === String(event.picId));

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

    const handleCreateTask = () => {
        if (!taskName) return toast.error("Task name is required");
        if (!picId) return toast.error("PIC is required");

        const filteredActivities = checklistItems.filter(item => item.trim() !== "");

        taskMutation.mutate({
            name: taskName,
            picId: Number(picId),
            sourceType: "EVENT",
            eventId,
            dueDate: dueDate || undefined,
            activities: filteredActivities
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        try {
            return format(new Date(dateStr), "MMM dd, yyyy");
        } catch {
            return dateStr;
        }
    };

    const { user: currentUser } = useUser();
    const isManager = currentUser && ["Leader", "SPV", "DPH"].includes(currentUser.role);

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="min-h-[44px]">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            <Card>
                <CardContent className="p-6 tv:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold tv:text-tv-xl">{event.name}</h2>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <p className="text-sm text-muted-foreground">Date: {formatDate(event.date)} - {formatDate(event.endDate)}</p>
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
                {isManager && (
                    <Button onClick={() => setModalOpen(true)} className="min-h-[44px]">
                        <Plus className="h-4 w-4 mr-1" /> Create Task
                    </Button>
                )}
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
                        <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Enter task name" />
                    </div>
                    <div className="space-y-2">
                        <Label>Assign PIC</Label>
                        <Select value={picId} onValueChange={setPicId}>
                            <SelectTrigger><SelectValue placeholder="Select PIC" /></SelectTrigger>
                            <SelectContent>
                                {users.filter(u => u.status === "Active").map((u) => (
                                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                    <Button 
                        className="w-full min-h-[44px]" 
                        onClick={handleCreateTask}
                        disabled={taskMutation.isPending}
                    >
                        {taskMutation.isPending ? "Creating..." : "Create Task"}
                    </Button>
                </div>
            </ModalForm>
        </div>
    );
}
