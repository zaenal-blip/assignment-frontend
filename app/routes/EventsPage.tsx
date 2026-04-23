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
import { Plus, Search, CalendarIcon, ArrowRight } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EventsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [createOpen, setCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const isLeaderOrUp =
    currentUser && ["Leader", "SPV", "DPH", "Yang punya TMMIN"].includes(currentUser.role);

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

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

  return (
    <div className="space-y-8 animate-fade-in-up px-2 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display text-glow">
            Events Board
          </h1>
          <p className="text-sm text-white/40 font-medium tracking-wide uppercase">
            Corporate milestones and mission schedules
          </p>
        </div>

        <div className="flex flex-1 max-w-md mx-auto w-full md:mx-0">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-cyan-400" />
            <Input
              placeholder="Search missions..."
              className="h-11 w-full bg-white/5 backdrop-blur-md pl-10 text-white border-white/10 rounded-2xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        {isLeaderOrUp && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl h-11 px-6 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Filter Section (Minimalist Glass) */}
      <div className="glass p-2 rounded-2xl border-none w-fit flex items-center gap-2">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
          <CalendarIcon className="h-4 w-4 text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2rem] text-white/40">Active Schedule</span>
        </div>
      </div>

      {/* Events Card List */}
      <div className="space-y-4">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.2fr_auto] gap-4 px-8 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
          <div>Mission Name</div>
          <div>Field Commander (PIC)</div>
          <div>Start Date</div>
          <div>Completion Date</div>
          <div>Status</div>
          <div></div>
        </div>

        <div className="space-y-4">
          {eventsData.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
                className="glass hover:bg-white/[0.08] p-4 lg:px-8 lg:py-5 rounded-3xl border-none transition-all duration-300 hover:scale-[1.01] hover:cyan-glow cursor-pointer group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.2fr_auto] items-center gap-4 lg:gap-6">
                  {/* Name */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base font-display tracking-tight group-hover:text-cyan-400 transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                      EVT-#{event.id.toString().padStart(4, "0")}
                    </p>
                  </div>
  
                  {/* PIC */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                      {event.picName.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-white/80">{event.picName}</span>
                  </div>

                {/* Dates */}
                <div className="space-y-1">
                  <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Start</p>
                  <span className="text-xs font-bold text-white/70">{formatDate(event.date)}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">End</p>
                  <span className="text-xs font-bold text-white/70">{formatDate(event.endDate)}</span>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge
                    status={event.status}
                    className={cn(
                      "px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest border border-white/10 shadow-inner",
                      event.status === "In Progress" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                      event.status === "Completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    )}
                  />
                </div>

                {/* Action */}
                <div className="flex lg:justify-end">
                  <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateEventModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        users={users}
      />
    </div>
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "@/lib/api";

function CreateEventModal({
  open,
  onOpenChange,
  users,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  users: any[];
}) {
  const [eventName, setEventName] = useState("");
  const [pic, setPic] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
      onOpenChange(false);
      setEventName("");
      setPic("");
      setStartDate(new Date());
      setEndDate(new Date());
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create event");
    },
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
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  };

  return (
    <ModalForm open={open} onOpenChange={onOpenChange} title="Initialize New Mission Event">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        <div className="space-y-3">
          <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Mission Identifier</Label>
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g. Q4 Strategic Synthesis"
            className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all px-4"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Initiation Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all",
                    !startDate && "text-white/20",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                  {startDate ? format(startDate, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-darker border-white/10 text-white backdrop-blur-3xl" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => d && setStartDate(d)}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-3">
            <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Target Completion</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all",
                    !endDate && "text-white/20",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                  {endDate ? format(endDate, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-darker border-white/10 text-white backdrop-blur-3xl" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => d && setEndDate(d)}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 opacity-80 ml-1">Lead Commander (PIC)</Label>
          <Select value={pic} onValueChange={setPic}>
            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white hover:bg-white/10 transition-colors">
              <SelectValue placeholder="Select PIC" />
            </SelectTrigger>
            <SelectContent className="glass-darker border-white/10 text-white backdrop-blur-3xl">
              {users
                .filter((u) => u.status === "Active" && u.role !== "Yang punya TMMIN")
                .map((u) => (
                  <SelectItem key={u.id} value={String(u.id)} className="focus:bg-cyan-500/20 focus:text-white cursor-pointer">
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleCreate}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Constructing...</span>
            </div>
          ) : "Finalize Mission Initialization"}
        </Button>
      </div>
    </ModalForm>
  );
}
