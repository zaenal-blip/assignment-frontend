import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { getEvents, getUsers, getStoredUser } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus } from "lucide-react";
import { ModalForm } from "@/components/ModalForm";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function EventsPage() {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [createOpen, setCreateOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        setCurrentUser(getStoredUser());
    }, []);

    const isLeaderOrUp = currentUser && ["Leader", "SPV", "DPH"].includes(currentUser.role);

    const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: getEvents });
    const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });

    const eventsData = useMemo(() => {
        return events.map((event) => {
            const pic = users.find((u) => String(u.id) === String(event.picId));
            return {
                ...event,
                picName: pic?.name || "Unknown",
            };
        });
    }, [events, users]);

    const formatDate = (d?: string) => {
        if (!d) return "-";
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
                    <h2 className="text-lg font-semibold">Events</h2>
                    {isLeaderOrUp && (
                        <Button onClick={() => setCreateOpen(true)} size="sm" className="min-h-[44px]">
                            <Plus className="h-4 w-4 mr-1" /> Create
                        </Button>
                    )}
                </div>
                {eventsData.map((event) => (
                    <Card key={event.id} className="cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold">{event.name}</h3>
                                <StatusBadge status={event.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">PIC: {event.picName}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(event.date)} — {formatDate(event.endDate)}</p>
                        </CardContent>
                    </Card>
                ))}
                <CreateEventModal open={createOpen} onOpenChange={setCreateOpen} users={users} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tv:text-tv-xl">Events</h2>
                {isLeaderOrUp && (
                    <Button onClick={() => setCreateOpen(true)} className="min-h-[44px]">
                        <Plus className="h-4 w-4 mr-1" /> Create Event
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event Name</TableHead>
                                <TableHead>PIC</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {eventsData.map((event) => (
                                <TableRow key={event.id} className="cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                                    <TableCell className="font-medium tv:text-tv-sm">{event.name}</TableCell>
                                    <TableCell className="tv:text-tv-sm">{event.picName}</TableCell>
                                    <TableCell className="text-sm">{formatDate(event.date)}</TableCell>
                                    <TableCell className="text-sm">{formatDate(event.endDate)}</TableCell>
                                    <TableCell><StatusBadge status={event.status} /></TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <CreateEventModal open={createOpen} onOpenChange={setCreateOpen} users={users} />
        </div>
    );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "@/lib/api";

function CreateEventModal({ open, onOpenChange, users }: { open: boolean; onOpenChange: (v: boolean) => void; users: any[] }) {
    const [eventName, setEventName] = useState("");
    const [pic, setPic] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
    
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            toast.success("Event created successfully!");
            onOpenChange(false);
            setEventName("");
            setPic("");
            setStartDate(new Date().toISOString().split("T")[0]);
            setEndDate(new Date().toISOString().split("T")[0]);
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create event");
        }
    });

    const handleCreate = () => {
        if (!eventName) {
            toast.error("Event name is required");
            return;
        }
        if (!pic) {
            toast.error("PIC is required");
            return;
        }
        
        mutation.mutate({
            name: eventName,
            picId: Number(pic),
            startDate,
            endDate
        });
    };

    return (
        <ModalForm open={open} onOpenChange={onOpenChange} title="Create Event">
            <div className="space-y-4">
                <div>
                    <Label>Event Name</Label>
                    <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Annual Meeting" className="mt-1 min-h-[44px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>Start Date</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 min-h-[44px]" />
                    </div>
                    <div>
                        <Label>End Date</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 min-h-[44px]" />
                    </div>
                </div>
                <div>
                    <Label>PIC</Label>
                    <Select value={pic} onValueChange={setPic}>
                        <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue placeholder="Select PIC" /></SelectTrigger>
                        <SelectContent>
                            {users.filter((u) => u.status === "Active").map((u) => (
                                <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.role})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleCreate} className="w-full min-h-[44px]" disabled={mutation.isPending}>
                    {mutation.isPending ? "Creating..." : "Create Event"}
                </Button>
            </div>
        </ModalForm>
    );
}
