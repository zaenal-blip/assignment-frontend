import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { events, tasks } from "@/data/mockData";
import { AlertTriangle, CalendarDays, Clock } from "lucide-react";
import { useNavigate } from "react-router";

function getBadgeStyle(type: "today" | "upcoming" | "due-soon" | "overdue") {
    switch (type) {
        case "today":
            return "bg-primary/15 text-primary border-primary/30";
        case "upcoming":
            return "bg-secondary/15 text-secondary border-secondary/30";
        case "due-soon":
            return "bg-warning/15 text-warning border-warning/30";
        case "overdue":
            return "bg-destructive/15 text-destructive border-destructive/30";
    }
}

interface HighlightCardProps {
    icon: React.ReactNode;
    title: string;
    items: { label: string; sub: string; badge: string; badgeType: "today" | "upcoming" | "due-soon" | "overdue"; onClick: () => void }[];
}

function HighlightCard({ icon, title, items }: HighlightCardProps) {
    if (items.length === 0) return null;
    return (
        <Card className="animate-fade-in">
            <CardContent className="p-4 tv:p-6">
                <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <h4 className="font-semibold text-foreground tv:text-tv-base">{title}</h4>
                </div>
                <div className="space-y-2.5">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            onClick={item.onClick}
                            className="flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-accent/50"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate tv:text-tv-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.sub}</p>
                            </div>
                            <Badge className={getBadgeStyle(item.badgeType)}>{item.badge}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function HighlightSection() {
    const navigate = useNavigate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const soon = new Date(today);
    soon.setDate(soon.getDate() + 5);

    // Today's events
    const todayEvents: HighlightCardProps["items"] = events
        .filter((e) => e.date === todayStr && e.status !== "Completed")
        .map((e) => ({
            label: e.name,
            sub: e.description,
            badge: "Today",
            badgeType: "today" as const,
            onClick: () => navigate(`/projects/${e.projectId}/events/${e.id}`),
        }));

    // Upcoming events (next 5 days, not today)
    const upcomingEvents: HighlightCardProps["items"] = events
        .filter((e) => {
            const d = new Date(e.date);
            return d > today && d <= soon && e.status !== "Completed";
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 4)
        .map((e) => ({
            label: e.name,
            sub: `Date: ${new Date(e.date).toLocaleDateString("default", { month: "short", day: "numeric" })}`,
            badge: "Upcoming",
            badgeType: "upcoming" as const,
            onClick: () => navigate(`/projects/${e.projectId}/events/${e.id}`),
        }));

    // Near deadline tasks (within 5 days, not completed)
    const nearDeadlineTasks: HighlightCardProps["items"] = tasks
        .filter((t) => {
            const d = new Date(t.dueDate);
            return d >= today && d <= soon && t.status !== "Completed";
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 4)
        .map((t) => {
            const d = new Date(t.dueDate);
            const isOverdue = d < today;
            return {
                label: t.name,
                sub: `Due: ${d.toLocaleDateString("default", { month: "short", day: "numeric" })}`,
                badge: isOverdue ? "Overdue" : "Due Soon",
                badgeType: isOverdue ? "overdue" as const : "due-soon" as const,
                onClick: () => navigate(`/tasks/${t.id}`),
            };
        });

    // Overdue tasks
    const overdueTasks: HighlightCardProps["items"] = tasks
        .filter((t) => {
            const d = new Date(t.dueDate);
            return d < today && t.status !== "Completed";
        })
        .slice(0, 4)
        .map((t) => ({
            label: t.name,
            sub: `Due: ${new Date(t.dueDate).toLocaleDateString("default", { month: "short", day: "numeric" })}`,
            badge: "Overdue",
            badgeType: "overdue" as const,
            onClick: () => navigate(`/tasks/${t.id}`),
        }));

    const allDeadlineItems = [...overdueTasks, ...nearDeadlineTasks].slice(0, 4);

    const cards = [
        {
            icon: <CalendarDays className="h-5 w-5 text-primary" />,
            title: "Today's Events",
            items: todayEvents,
        },
        {
            icon: <Clock className="h-5 w-5 text-secondary" />,
            title: "Upcoming Events",
            items: upcomingEvents,
        },
        {
            icon: <AlertTriangle className="h-5 w-5 text-warning" />,
            title: "Near Deadline Tasks",
            items: allDeadlineItems,
        },
    ].filter((c) => c.items.length > 0);

    if (cards.length === 0) return null;

    return (
        <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 tv:text-tv-xl">Highlight Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 tv:gap-6">
                {cards.map((card, i) => (
                    <HighlightCard key={i} {...card} />
                ))}
            </div>
        </div>
    );
}
