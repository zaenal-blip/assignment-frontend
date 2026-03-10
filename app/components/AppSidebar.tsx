import { LayoutDashboard, FolderKanban, ClipboardList, Users, ClipboardCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router";
import tpsLogo from "@/assets/tps3.png";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Regular Activity", url: "/regular-activity", icon: ClipboardCheck },
    { title: "Personal Job", url: "/personal-job", icon: ClipboardList },
    { title: "Users", url: "/users", icon: Users },
];

export function AppSidebar() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-4">
                {!collapsed ? (
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1F3556] p-1">
                            <img src={tpsLogo} alt="TPS logo" className="h-full w-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-sidebar-foreground uppercase tracking-tight">TPS Board</h2>
                            <p className="text-[10px] text-sidebar-foreground/60">Assignment System</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
                            <img src={tpsLogo} alt="TPS logo" className="h-full w-full object-contain" />
                        </div>
                    </div>
                )}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const isActive =
                                    location.pathname === item.url ||
                                    (item.url === "/projects" && location.pathname.startsWith("/projects")) ||
                                    (item.url === "/dashboard" && location.pathname === "/");
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <NavLink
                                                to={item.url}
                                                className="transition-colors"
                                                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {!collapsed && <span>{item.title}</span>}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
