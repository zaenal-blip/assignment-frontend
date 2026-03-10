import { Bell } from "lucide-react";
import { useLocation } from "react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { currentUser } from "@/data/mockData";
import { UserDropdown } from "@/components/UserDropdown";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/personal-job": "Personal Job",
    "/users": "Users",
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

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 tv:h-20 tv:px-8">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-lg font-semibold text-foreground tv:text-tv-xl">{title}</h1>
            <div className="ml-auto flex items-center gap-3">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-muted">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                </button>
                <UserDropdown user={currentUser} />
            </div>
        </header>
    );
}
