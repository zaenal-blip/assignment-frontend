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
        <div className="space-y-6 tv:space-y-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 tv:gap-6">
                <StatCard icon={FolderKanban} label="Total Projects" value={totalProjects} accent="bg-primary" />
                <StatCard icon={CalendarDays} label="Total Events" value={totalEvents} accent="bg-secondary" />
                <StatCard icon={ListChecks} label="Total Tasks" value={totalTasks} accent="bg-warning" />
                <StatCard icon={CheckCircle2} label="Completed Tasks" value={completedTasks} accent="bg-success" />
            </div>

            <HighlightSection events={events} tasks={tasks} />

            <Card>
                <CardHeader>
                    <CardTitle className="tv:text-tv-xl">Event Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <CalendarBoard events={events} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="tv:text-tv-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.slice(0, 6).map((activity) => {
                            const user = getUserById(activity.userId);
                            return (
                                <div key={activity.id} className="flex items-start gap-3">
                                    {user && <AvatarBadge user={user} size="sm" />}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm tv:text-tv-sm">
                                            <span className="font-medium">{user?.name || "Guest"}</span>{" "}
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatActivityDate(activity.timestamp)}</p>
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
