import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CalendarDays, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import {
  format,
  addDays,
  parseISO,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";
import type { Event } from "@/types";
import type { Task } from "@/types";

function getBadgeStyle(type: "today" | "upcoming" | "due-soon" | "overdue") {
  switch (type) {
    case "today":
    case "upcoming":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "due-soon":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "overdue":
      return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  }
}

interface HighlightCardProps {
  icon: React.ReactNode;
  title: string;
  items: {
    label: string;
    sub: string;
    badge: string;
    badgeType: "today" | "upcoming" | "due-soon" | "overdue";
    onClick: () => void;
  }[];
}

function HighlightCard({ icon, title, items }: HighlightCardProps) {
  if (items.length === 0) return null;
  return (
    <Card className="glass border-none animate-fade-in group">
      <CardContent className="p-4 tv:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/20 transition-colors">
            {icon}
          </div>
          <h4 className="font-semibold text-white tv:text-tv-base">{title}</h4>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              onClick={item.onClick}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/10 group/item"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-white/90 tv:text-tv-sm group-hover/item:text-cyan-400 transition-colors">
                  {item.label}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mt-0.5">
                  {item.sub}
                </p>
              </div>
              <Badge
                className={`${getBadgeStyle(item.badgeType)} font-bold text-[10px] px-2 py-0.5 rounded-full border shadow-none`}
              >
                {item.badge}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface HighlightSectionProps {
  events: Event[];
  tasks: Task[];
}

export function HighlightSection({ events, tasks }: HighlightSectionProps) {
  const navigate = useNavigate();

  // Use local time for strings consistency
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const soonDate = addDays(now, 5);
  const soonStr = format(soonDate, "yyyy-MM-dd");

  // Today's events
  const todayEvents: HighlightCardProps["items"] = events
    .filter((e) => e.date === todayStr && e.status !== "Completed")
    .map((e) => ({
      label: e.name,
      sub: "Scheduled for today",
      badge: "Today",
      badgeType: "today" as const,
      onClick: () => navigate(`/events/${e.id}`),
    }));

  // Upcoming events (next 5 days, starting tomorrow)
  const upcomingEvents: HighlightCardProps["items"] = events
    .filter(
      (e) => e.date > todayStr && e.date <= soonStr && e.status !== "Completed",
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
    .map((e) => ({
      label: e.name,
      sub: `Date: ${format(parseISO(e.date), "MMM dd")}`,
      badge: "Upcoming",
      badgeType: "upcoming" as const,
      onClick: () => navigate(`/events/${e.id}`),
    }));

  // Task Highlights (Overdue & Due Soon)
  // We prioritize tasks with explicit dueDate or date (for regular activities)
  const activeTasks = tasks.filter((t) => t.status !== "Completed");

  const taskItems: HighlightCardProps["items"] = activeTasks
    .map((t) => {
      const dateStr = t.dueDate || t.date;
      if (!dateStr) return null;

      const d = parseISO(dateStr);
      const isToday = isSameDay(d, now);
      const isOverdue = !isToday && isBefore(d, now);
      const isSoon = !isToday && !isOverdue && isBefore(d, soonDate);

      if (!isToday && !isOverdue && !isSoon) return null;

      let badgeType: "today" | "overdue" | "due-soon" = "due-soon";
      let badgeLabel = "Due Soon";

      if (isToday) {
        badgeType = "today";
        badgeLabel = "Today";
      } else if (isOverdue) {
        badgeType = "overdue";
        badgeLabel = "Overdue";
      }

      return {
        label: t.name,
        sub: `Due: ${format(d, "MMM dd")}`,
        badge: badgeLabel,
        badgeType: badgeType,
        onClick: () => navigate(`/tasks/${t.id}`),
        _date: dateStr, // for sorting
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a._date.localeCompare(b._date))
    .slice(0, 6);

  const cards = [
    {
      icon: <CalendarDays className="h-4 w-4 text-primary" />,
      title: "Today's Events",
      items: todayEvents,
    },
    {
      icon: <Clock className="h-4 w-4 text-secondary" />,
      title: "Upcoming Events",
      items: upcomingEvents,
    },
    {
      icon: <AlertTriangle className="h-4 w-4 text-warning" />,
      title: "Priority Tasks",
      items: taskItems,
    },
  ].filter((c) => c.items.length > 0);

  if (cards.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white/40 mb-4 tv:text-tv-xl">
        Highlight Information
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 tv:gap-6">
        {cards.map((card, i) => (
          <HighlightCard key={i} {...card} />
        ))}
      </div>
    </div>
  );
}
