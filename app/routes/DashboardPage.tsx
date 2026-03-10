import { useState } from "react";
import { FolderKanban, CalendarDays, ListChecks, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { CalendarBoard } from "@/components/CalendarBoard";
import { AvatarBadge } from "@/components/AvatarBadge";
import { HighlightSection } from "@/components/HighlightSection";
import { projects, events, tasks, activities, getUserById } from "@/data/mockData";

export default function DashboardPage() {
    const totalProjects = projects.length;
    const totalEvents = events.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;

    const sortedActivities = [...activities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <div className="space-y-6 tv:space-y-10">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 tv:gap-6">
                <StatCard icon={FolderKanban} label="Total Projects" value={totalProjects} accent="bg-primary" />
                <StatCard icon={CalendarDays} label="Total Events" value={totalEvents} accent="bg-secondary" />
                <StatCard icon={ListChecks} label="Total Tasks" value={totalTasks} accent="bg-warning" />
                <StatCard icon={CheckCircle2} label="Completed Tasks" value={completedTasks} accent="bg-success" />
            </div>

            {/* Highlight Section */}
            <HighlightSection />

            {/* Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="tv:text-tv-xl">Event Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <CalendarBoard events={events} />
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="tv:text-tv-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sortedActivities.slice(0, 6).map((activity) => {
                            const user = getUserById(activity.userId);
                            return (
                                <div key={activity.id} className="flex items-start gap-3">
                                    {user && <AvatarBadge user={user} size="sm" />}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm tv:text-tv-sm">
                                            <span className="font-medium">{user?.name}</span>{" "}
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.timestamp).toLocaleDateString("default", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
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
