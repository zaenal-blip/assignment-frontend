import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import type { Event } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CalendarBoardProps {
    events: Event[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarBoard({ events }: CalendarBoardProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const isMobile = useIsMobile();
    const [isTablet, setIsTablet] = useState(false);

    // Simple tablet detection
    useEffect(() => {
        const check = () => setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const prev = () => setCurrentDate(new Date(year, month - 1, 1));
    const next = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }, [year, month]);

    const getEventsForDay = (day: number): Event[] => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return events.filter((e) => e.date === dateStr);
    };

    // Week view for tablet
    const currentWeekStart = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek);
    }, []);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [currentWeekStart]);

    // Mobile: agenda list
    if (isMobile) {
        const sortedEvents = [...events]
            .filter((e) => {
                const ed = new Date(e.date);
                return ed.getMonth() === month && ed.getFullYear() === year;
            })
            .sort((a, b) => a.date.localeCompare(b.date));

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
                    <h2 className="font-semibold">{monthName}</h2>
                    <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                {sortedEvents.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">No events this month</p>
                ) : (
                    <div className="space-y-2">
                        {sortedEvents.map((event) => (
                            <div key={event.id} className="flex gap-3 items-start">
                                <div className="flex flex-col items-center pt-1">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(event.date).toLocaleDateString("default", { weekday: "short" })}
                                    </span>
                                    <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
                                </div>
                                <div className="flex-1">
                                    <EventCard event={event} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Tablet: week view
    if (isTablet) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
                    <h2 className="font-semibold">{monthName}</h2>
                    <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day, i) => {
                        const dayEvents = getEventsForDay(day.getDate());
                        const isToday = day.toDateString() === new Date().toDateString();
                        const isCurrentMonth = day.getMonth() === month;
                        return (
                            <div key={i} className={cn("min-h-[120px] rounded-lg border p-2", isToday && "border-primary bg-primary/5")}>
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-xs text-muted-foreground">{DAYS[i]}</span>
                                    <span className={cn("text-sm font-medium", !isCurrentMonth && "text-muted-foreground/50")}>
                                        {day.getDate()}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.map((e) => (
                                        <EventCard key={e.id} event={e} compact />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Desktop: full month
    const today = new Date();
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
                <h2 className="text-lg font-semibold tv:text-tv-lg">{monthName}</h2>
                <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
                {DAYS.map((day) => (
                    <div key={day} className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground tv:text-tv-sm tv:py-3">
                        {day}
                    </div>
                ))}
                {calendarDays.map((day, idx) => {
                    const isToday =
                        day !== null &&
                        today.getDate() === day &&
                        today.getMonth() === month &&
                        today.getFullYear() === year;
                    const dayEvents = day ? getEventsForDay(day) : [];
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "min-h-[90px] bg-card p-1.5 tv:min-h-[140px] tv:p-3",
                                isToday && "bg-primary/5"
                            )}
                        >
                            {day !== null && (
                                <>
                                    <span
                                        className={cn(
                                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs tv:h-8 tv:w-8 tv:text-tv-sm",
                                            isToday && "bg-primary text-primary-foreground font-bold"
                                        )}
                                    >
                                        {day}
                                    </span>
                                    <div className="mt-1 space-y-1">
                                        {dayEvents.map((event) => (
                                            <EventCard key={event.id} event={event} compact />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
