import { Bell, Search, Calendar } from "lucide-react";
import { useLocation, Link } from "react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { currentUser } from "@/data/mockData";
import { UserDropdown } from "@/components/UserDropdown";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/personal-job": "Personal Job",
    "/users": "Users",
    "/regular-activity": "Regular Activity",
};

function getPageTitle(pathname: string): string {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith("/projects/")) return "Project Detail";
    if (pathname.startsWith("/events/")) return "Event Detail";
    if (pathname.startsWith("/tasks/")) return "Task Detail";
    if (pathname === "/") return "Dashboard";
    return "TPS Board";
}

export function Topbar() {
    const location = useLocation();
    const title = getPageTitle(location.pathname);
    const today = new Date();

    // Simple breadcrumbs logic
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
        const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        return (
            <div key={url} className="flex items-center">
                <span className="mx-1 text-muted-foreground/40">/</span>
                {isLast ? (
                    <span className="text-xs font-medium text-foreground">{label}</span>
                ) : (
                    <Link to={url} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {label}
                    </Link>
                )}
            </div>
        );
    });

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-card px-4 tv:h-24 tv:px-10">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            TPS
                        </Link>
                        {breadcrumbs}
                    </div>
                    <h1 className="text-lg font-bold text-foreground tv:text-tv-2xl leading-tight">{title}</h1>
                </div>
            </div>

            {/* Global Search - Hidden on small mobile */}
            <div className="mx-auto hidden max-w-md flex-1 px-4 md:block">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Search assignments, projects..."
                        className="h-9 w-full bg-muted/50 pl-10 focus-visible:bg-background transition-all border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                    />
                </div>
            </div>

            <div className="ml-auto flex items-center gap-2 tv:gap-6">
                {/* Date Display - Desktop only */}
                <div className="hidden items-center gap-2 rounded-full bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground lg:flex">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(today, "EEEE, MMM dd, yyyy")}</span>
                </div>

                <div className="flex items-center gap-1 tv:gap-3">
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-muted active:scale-95 tv:h-12 tv:w-12">
                        <Bell className="h-5 w-5 text-muted-foreground tv:h-7 tv:w-7" />
                        <span className="absolute right-2 top-2 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
                        </span>
                    </button>
                    <div className="h-6 w-px bg-border tv:h-10 mx-1 lg:block hidden" />
                    <UserDropdown user={currentUser} />
                </div>
            </div>
        </header>
    );
}
