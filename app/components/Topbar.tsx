import { useEffect, useState } from "react";
import { Bell, Search, Calendar } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getStoredUser } from "@/lib/api";
import { useUser } from "@/hooks/use-user";
import { UserDropdown } from "@/components/UserDropdown";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const { user: currentUser } = useUser();
  const [today, setToday] = useState<Date | null>(null);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  useEffect(() => {
    setToday(new Date());
  }, []);

  // Simple breadcrumbs logic
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const isLast = index === pathSegments.length - 1;
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

    return (
      <div key={url} className="flex items-center">
        <span className="mx-1 text-muted-foreground/40">/</span>
        {isLast ? (
          <span className="text-xs font-medium text-foreground">{label}</span>
        ) : (
          <Link
            to={url}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {label}
          </Link>
        )}
      </div>
    );
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center glass-darker border-b border-white/5 px-4 tv:h-24 tv:px-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="lg:hidden text-white" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              TPS
            </Link>
            {breadcrumbs}
          </div>
          <h1 className="text-lg font-bold text-white tv:text-tv-2xl leading-tight text-glow">
            {title}
          </h1>
        </div>
      </div>

      {/* Global Search - Hidden on small mobile */}
      <div className="mx-auto hidden max-w-md flex-1 px-4 md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-cyan-400" />
          <Input
            placeholder="Search assignments, projects..."
            className="h-9 w-full bg-white/5 backdrop-blur-sm pl-10 text-white placeholder:text-white/20 focus-visible:bg-white/10 transition-all border border-white/10 focus-visible:ring-1 focus-visible:ring-cyan-500/50"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 tv:gap-6">
        {/* Date Display - Desktop only */}
        <div className="hidden items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 lg:flex">
          <Calendar className="h-3.5 w-3.5 text-cyan-400" />
          <span>{today && format(today, "EEEE, MMM dd, yyyy")}</span>
        </div>

        <div className="flex items-center gap-1 tv:gap-3">
          {currentUser?.role !== "Yang punya TMMIN" && <NotificationDropdown />}
          <div className="h-6 w-px bg-white/10 tv:h-10 mx-1 lg:block hidden" />
          <UserDropdown
            user={
              currentUser ?? {
                id: "",
                name: "Guest",
                email: "",
                phone: "",
                role: "Member",
                avatar: "G",
                status: "Active",
              }
            }
          />
        </div>
      </div>
    </header>
  );
}

// Sub-component for Notifications
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

function NotificationDropdown() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const readMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-muted active:scale-95 tv:h-12 tv:w-12">
          <Bell className="h-5 w-5 text-muted-foreground tv:h-7 tv:w-7" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[400px] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-muted-foreground flex gap-1"
              onClick={(e: any) => {
                e.stopPropagation();
                readAllMutation.mutate();
              }}
              disabled={readAllMutation.isPending}
            >
              <CheckCircle2 className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={cn(
                "flex flex-col items-start gap-1 p-3 cursor-pointer",
                n.isRead ? "opacity-60" : "bg-muted/30",
              )}
              onClick={() => {
                if (!n.isRead) readMutation.mutate(n.id);
                if (n.targetType && n.targetId) {
                  if (n.targetType === "TASK") navigate(`/tasks/${n.targetId}`);
                  else if (n.targetType === "PROJECT")
                    navigate(`/projects/${n.targetId}`);
                  else if (n.targetType === "EVENT")
                    navigate(`/events/${n.targetId}`);
                  else if (n.targetType === "PERSONAL_JOB")
                    navigate(`/dashboard`);
                }
              }}
            >
              <span className="text-sm">{n.message}</span>
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(n.createdAt), "MMM dd, HH:mm")}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
