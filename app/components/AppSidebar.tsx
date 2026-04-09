// import { LayoutDashboard, FolderKanban, ClipboardList, Users, ClipboardCheck } from "lucide-react";
// import { NavLink } from "@/components/NavLink";
// import { useLocation } from "react-router";
// import tpsLogo from "@/assets/tps3.png";
// import {
//     Sidebar,
//     SidebarContent,
//     SidebarGroup,
//     SidebarGroupContent,
//     SidebarGroupLabel,
//     SidebarMenu,
//     SidebarMenuButton,
//     SidebarMenuItem,
//     SidebarHeader,
//     useSidebar,
// } from "@/components/ui/sidebar";

// const menuItems = [
//     { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
//     { title: "Projects", url: "/projects", icon: FolderKanban },
//     { title: "Regular Activity", url: "/regular-activity", icon: ClipboardCheck },
//     { title: "Personal Job", url: "/personal-job", icon: ClipboardList },
//     { title: "Users", url: "/users", icon: Users },
// ];

// export function AppSidebar() {
//     const { state } = useSidebar();
//     const collapsed = state === "collapsed";
//     const location = useLocation();

//     return (
//         <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
//             <SidebarHeader className="px-6 py-5">
//                 {!collapsed ? (
//                     <div className="flex items-center gap-3.5 group">
//                         <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-sm transition-transform duration-300 group-hover:scale-105">
//                             <img src={tpsLogo} alt="TPS logo" className="h-7 w-7 object-contain" />
//                         </div>
//                         <div className="flex flex-col min-w-0">
//                             <h2 className="text-[17px] font-bold text-[#1e3a5f] uppercase tracking-tight leading-tight truncate">TPS Board</h2>
//                             <p className="text-[10px] text-sidebar-foreground/40 font-medium tracking-wide uppercase">Assignment System</p>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="flex justify-center py-2">
//                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f] shadow-md">
//                             <img src={tpsLogo} alt="TPS logo" className="h-6 w-6 object-contain" />
//                         </div>
//                     </div>
//                 )}
//             </SidebarHeader>
//             <SidebarContent className="px-3">
//                 <SidebarGroup>
//                     <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] uppercase tracking-[0.2em] font-bold px-4 mb-3 mt-2">
//                         Menu
//                     </SidebarGroupLabel>
//                     <SidebarGroupContent>
//                         <SidebarMenu className="gap-1.5">
//                             {menuItems.map((item) => {
//                                 const formatDate = (d?: string) => {
//                                     if (!d) return "-";
//                                     try {
//                                         const date = new Date(d);
//                                         return isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
//                                     } catch {
//                                         return "-";
//                                     }
//                                 };
//                                 const isActive =
//                                     location.pathname === item.url ||
//                                     (item.url === "/projects" && location.pathname.startsWith("/projects")) ||
//                                     (item.url === "/dashboard" && location.pathname === "/");
//                                 return (
//                                     <SidebarMenuItem key={item.title}>
//                                         <SidebarMenuButton
//                                             asChild
//                                             isActive={isActive}
//                                             tooltip={item.title}
//                                             className={`
//                                                 relative h-11 transition-all duration-200 ease-out rounded-lg px-4
//                                                 ${isActive
//                                                     ? 'bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold'
//                                                     : 'text-sidebar-foreground/60 hover:bg-[#1e3a5f]/5 hover:text-[#1e3a5f] hover:translate-x-1'
//                                                 }
//                                             `}
//                                         >
//                                             <NavLink
//                                                 to={item.url}
//                                                 className="flex items-center w-full gap-3.5 group/link"
//                                             >
//                                                 {/* Left Indicator Line */}
//                                                 {isActive && (
//                                                     <div className="absolute left-0 w-1 h-6 bg-[#1e3a5f] rounded-r-full shadow-[0_0_8px_rgba(30,58,95,0.3)]" />
//                                                 )}

//                                                 <div className="flex items-center justify-center w-5">
//                                                     <item.icon className={`h-[18px] w-[18px] transition-all duration-200
//                                                         ${isActive ? 'text-[#1e3a5f] scale-110' : 'text-sidebar-foreground/50 group-hover/link:text-[#1e3a5f]'}
//                                                     `} />
//                                                 </div>

//                                                 {!collapsed && (
//                                                     <span className="truncate text-[14px]">
//                                                         {item.title}
//                                                     </span>
//                                                 )}
//                                             </NavLink>
//                                         </SidebarMenuButton>
//                                     </SidebarMenuItem>
//                                 );
//                             })}
//                         </SidebarMenu>
//                     </SidebarGroupContent>
//                 </SidebarGroup>
//             </SidebarContent>
//         </Sidebar>
//     );
// }

import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Users,
  LogOut,
} from "lucide-react";

import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router";
import { getStoredUser, type AppUser } from "@/lib/api";
import { useUser } from "@/hooks/use-user";
import { AvatarBadge } from "@/components/AvatarBadge";
import tpsLogo from "@/assets/tps3.png";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Events", url: "/events", icon: CalendarDays },
  { title: "Regular Activity", url: "/regular-activity", icon: ClipboardCheck },
  { title: "Personal Job", url: "/personal-job", icon: ClipboardList },
  { title: "Users", url: "/users", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const guestUser: AppUser = {
    id: "0",
    name: "Guest",
    email: "",
    phone: "",
    role: "Member",
    avatar: "G",
    status: "Active",
  };
  const displayUser = user ?? guestUser;

  return (
    <Sidebar collapsible="icon" className="bg-[#1e3a5f] border-r-0 text-white">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-white/20 px-4 py-6 bg-[#1e3a5f]">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-1 transition-all duration-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 shadow-sm ring-1 ring-white/20">
              <img
                src={tpsLogo}
                alt="TPS logo"
                className="h-6 w-6 object-contain brightness-0 invert"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase truncate">
                TPS Board
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">
                Management System
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-transform hover:scale-110">
              <img
                src={tpsLogo}
                alt="TPS logo"
                className="h-6 w-6 object-contain brightness-0 invert"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-4 bg-[#1e3a5f]">
        <SidebarGroup>
          {!collapsed && (
            <p className="mb-3 px-4 text-[12px] font-bold uppercase tracking-[0.2em] text-white/30">
              Navigation
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems
                .filter(
                  (item) =>
                    item.url !== "/users" ||
                    ["Leader", "SPV", "DPH"].includes(user?.role || ""),
                )
                .map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    (item.url !== "/dashboard" &&
                      location.pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <NavLink
                          to={item.url}
                          end={item.url === "/dashboard"}
                          className={`group flex items-center gap-3 rounded-lg px-4 py-2 transition-all duration-200 border-l-2
                          ${
                            isActive
                              ? "bg-white/15 text-white border-white shadow-sm"
                              : "text-white/70 border-transparent hover:bg-white/5 hover:text-white hover:scale-[1.02]"
                          }`}
                        >
                          <item.icon
                            className={`h-5 w-5 shrink-0 transition-colors
                          ${isActive ? "text-white" : "text-white/50 group-hover:text-white"}`}
                          />
                          {!collapsed && (
                            <span
                              className={`truncate ${isActive ? "font-medium" : ""}`}
                            >
                              {item.title}
                            </span>
                          )}
                          {!collapsed && isActive && (
                            <div className="ml-auto flex h-1.5 w-1.5 rounded-full bg-white opacity-40" />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-t border-white/20 p-4 bg-[#1e3a5f]">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/5 transition-all hover:bg-white/10">
            <AvatarBadge user={displayUser} size="sm" showRole={false} />
            <div className="flex flex-1 flex-col min-w-0">
              <span className="truncate text-xs font-bold text-white">
                {displayUser.name}
              </span>
              <span className="truncate text-[10px] uppercase font-medium text-white/40">
                {displayUser.role}
              </span>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="group/logout rounded-lg p-2 text-white/30 transition-all hover:bg-red-500/20 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover/logout:scale-110" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <AvatarBadge user={displayUser} size="sm" showRole={false} />
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg p-2.5 text-white/30 transition-all hover:bg-white/10 hover:text-white"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
