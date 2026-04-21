import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, CalendarDays, ListChecks, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { CalendarBoard } from "@/components/CalendarBoard";
import { AvatarBadge } from "@/components/AvatarBadge";
import { HighlightSection } from "@/components/HighlightSection";
import { getEvents, getProjects, getTasks, getUsers } from "@/lib/api";
import type { Event, Project, Task } from "@/types";
import { cn } from "@/lib/utils";

function formatActivityDate(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function DashboardPage() {
    const { data: projects = [] } = useQuery<Project[]>({ queryKey: ["projects"], queryFn: getProjects });
    const { data: events = [] } = useQuery<Event[]>({ queryKey: ["events"], queryFn: getEvents });
    const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["tasks"], queryFn: () => getTasks() });
    const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });

    const totalProjects = projects.length;
    const totalEvents = events.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;

    const recentActivities = useMemo(() => {
        const activities = tasks.map((task: any) => {
            const isCompleted = task.status === "DONE" || task.status === "Completed";
            return {
                id: String(task.id),
                message: `${isCompleted ? "Completed task:" : "Updated task:"} ${task.name}`,
                timestamp: task.updatedAt || task.createdAt || task.dueDate || new Date().toISOString(),
                userId: String(task.picId),
            };
        });

        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [tasks]);

    const getUserById = (userId: string) => users.find((user) => user.id === userId);

    return (
        <div className="space-y-6 tv:space-y-10 animate-fade-in-up">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 tv:gap-6">
                <StatCard icon={FolderKanban} label="Total Projects" value={totalProjects} />
                <StatCard icon={CalendarDays} label="Total Events" value={totalEvents} />
                <StatCard icon={ListChecks} label="Total Tasks" value={totalTasks} />
                <StatCard icon={CheckCircle2} label="Completed Tasks" value={completedTasks} />
            </div>

            <HighlightSection events={events} tasks={tasks} />

            <Card className="glass border-none overflow-hidden">
                <CardHeader className="border-b border-white/10 py-4">
                    <CardTitle className="text-xl font-bold text-white tv:text-tv-xl flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-cyan-400" />
                        Event Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <CalendarBoard events={events} projects={projects} />
                </CardContent>
            </Card>

            <Card className="glass border-none overflow-hidden">
                <CardHeader className="border-b border-white/10 py-4">
                    <CardTitle className="text-xl font-bold text-white tv:text-tv-xl flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-blue-400" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {recentActivities.slice(0, 6).map((activity) => {
                            const user = getUserById(activity.userId);
                            const isCompleted = activity.message.toLowerCase().includes("completed");
                            return (
                                <div key={activity.id} className="flex items-start gap-4 p-4 transition-colors hover:bg-white/5 group">
                                    <div className="relative">
                                        {user && <AvatarBadge user={user} size="sm" className="ring-2 ring-white/10 group-hover:ring-cyan-500/50 transition-all" />}
                                        <div className={cn(
                                            "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#1e3a5f] z-10",
                                            isCompleted ? "bg-emerald-500" : "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,1)]"
                                        )} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-sm text-white/90 tv:text-tv-sm leading-tight">
                                                <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                    {user?.name || "Guest"}
                                                </span>{" "}
                                                {activity.message}
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mt-1">
                                            {formatActivityDate(activity.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
