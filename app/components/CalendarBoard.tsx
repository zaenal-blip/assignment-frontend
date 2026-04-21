
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import type { Event, Project } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CalendarBoardProps {
    events: Event[];
    projects: Project[];
}

type FilterType = "All" | "Events" | "Projects";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarBoard({ events, projects }: CalendarBoardProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeFilter, setActiveFilter] = useState<FilterType>("All");
    const isMobile = useIsMobile();
    const [isTablet, setIsTablet] = useState(false);

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

    const monthName = currentDate.toLocaleString("default", { month: "long" });

    // Combine and filter data
    const filteredItems = useMemo(() => {
        const results: any[] = [];
        
        if (activeFilter === "All" || activeFilter === "Events") {
            results.push(...events.map(e => ({ ...e, calendarType: "event" })));
        }
        
        if (activeFilter === "All" || activeFilter === "Projects") {
            results.push(...projects.map(p => ({ 
                ...p, 
                date: p.endDate, // Use endDate as the calendar point for projects
                calendarType: "project" 
            })));
        }
        
        return results;
    }, [events, projects, activeFilter]);

    const getItemsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return filteredItems.filter((item) => item.date.startsWith(dateStr));
    };

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }, [year, month]);

    const today = new Date();

    const FilterPill = ({ type, label }: { type: FilterType; label: string }) => (
        <button
            onClick={() => setActiveFilter(type)}
            className={cn(
                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                activeFilter === type 
                    ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105" 
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
            )}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner">
                        <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white font-display tracking-tight text-glow">Event Calendar</h2>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Protocol Schedule & Milestones</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="glass p-1.5 rounded-full flex items-center gap-1">
                    <FilterPill type="All" label="All" />
                    <FilterPill type="Events" label="Events" />
                    <FilterPill type="Projects" label="Projects" />
                </div>

                {/* Month Navigation */}
                <div className="glass flex items-center gap-6 px-6 py-2 rounded-2xl border-white/5">
                    <button onClick={prev} className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="min-w-[120px] text-center">
                        <span className="text-lg font-black text-white font-display uppercase tracking-tighter">{monthName}</span>
                        <span className="ml-2 text-sm font-bold text-cyan-400/50">{year}</span>
                    </div>
                    <button onClick={next} className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="glass overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                {/* Weekday Names */}
                <div className="grid grid-cols-7 bg-white/5 backdrop-blur-md border-b border-white/10">
                    {DAYS.map((day) => (
                        <div key={day} className="px-2 py-5 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-px bg-white/5">
                    {calendarDays.map((day, idx) => {
                        const isToday =
                            day !== null &&
                            today.getDate() === day &&
                            today.getMonth() === month &&
                            today.getFullYear() === year;
                        const items = day ? getItemsForDay(day) : [];
                        
                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "min-h-[140px] bg-[#0c0d1e]/40 p-3 transition-all duration-500 hover:bg-white/[0.05] group/day relative overflow-hidden",
                                    day === null && "bg-transparent opacity-10"
                                )}
                            >
                                {day !== null && (
                                    <>
                                        {/* Day Number */}
                                        <div className="flex justify-between items-start mb-3">
                                            <span
                                                className={cn(
                                                    "inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black transition-all duration-500 relative z-10",
                                                    isToday 
                                                        ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110" 
                                                        : "text-white/40 group-hover/day:text-white group-hover/day:bg-white/10"
                                                )}
                                            >
                                                {day}
                                            </span>
                                            {items.length > 0 && !isToday && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse mt-3.5" />
                                            )}
                                        </div>

                                        {/* Items List */}
                                        <div className="space-y-2 max-h-[85px] overflow-y-auto no-scrollbar relative z-10">
                                            {items.map((item) => (
                                                <EventCard 
                                                    key={`${item.calendarType}-${item.id}`} 
                                                    event={item} 
                                                    compact 
                                                />
                                            ))}
                                        </div>

                                        {/* Subtle background glow for today */}
                                        {isToday && (
                                            <div className="absolute top-0 left-0 w-full h-full bg-cyan-500/5 blur-[40px] pointer-events-none" />
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
