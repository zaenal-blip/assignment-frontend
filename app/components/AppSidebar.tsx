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
  Target,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Pin, PinOff } from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Events", url: "/events", icon: CalendarDays },
  { title: "Regular Activity", url: "/regular-activity", icon: ClipboardCheck },
  { title: "Personal Job", url: "/personal-job", icon: ClipboardList },
  { title: "KPI Hoshin", url: "/hoshin", icon: Target },
  { title: "Users", url: "/users", icon: Users },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const [isPinned, setIsPinned] = useState(false);
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
    <Sidebar
      collapsible="icon"
      className="bg-gradient-to-b from-[#0b1220] via-[#0a1120] to-[#020617]
backdrop-blur-3xl
border-r border-cyan-500/10
shadow-[inset_-1px_0_0_rgba(56,189,248,0.08)] text-white transition-all duration-500 ease-in-out"
      onMouseEnter={() => !isPinned && setOpen(true)}
      onMouseLeave={() => !isPinned && setOpen(false)}
    >
      {/* Brand Header */}
      <SidebarHeader className="border-b border-white/5 px-4 py-8 bg-transparent relative group">
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block z-50">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-1.5 rounded-xl transition-all duration-300 ${
              isPinned
                ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                : "text-white/20 hover:bg-white/10 hover:text-white"
            }`}
            title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
          >
            {isPinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </button>
        </div>
        {!collapsed ? (
          <div className="flex items-center gap-4 px-2 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-500">
              <img
                src={tpsLogo}
                alt="TPS logo"
                className="h-7 w-7 object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-extrabold tracking-tight text-white uppercase truncate font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                AURA
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/80">
                Management System
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 ring-1 ring-white/20 transition-all duration-500 hover:scale-110 shadow-lg shadow-cyan-500/20">
              <img
                src={tpsLogo}
                alt="TPS logo"
                className="h-7 w-7 object-contain brightness-0 invert"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-6 bg-transparent no-scrollbar">
        <SidebarGroup>
          {!collapsed && (
            <p className="mb-6 px-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-2">
              <span className="h-[1px] w-4 bg-white/10" />
              Main Menu
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {menuItems
                .filter(
                  (item) =>
                    item.url !== "/users" ||
                    ["Leader", "SPV", "DPH", "Yang punya TMMIN"].includes(
                      user?.role || "",
                    ),
                )
                .filter(
                  (item) =>
                    item.url !== "/hoshin" || user?.role === "Yang punya TMMIN",
                )
                .map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    (item.url !== "/dashboard" &&
                      location.pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className="group/btn h-auto p-0"
                      >
                        <NavLink
                          to={item.url}
                          end={item.url === "/dashboard"}
                          className={`relative group flex items-center gap-3.5 rounded-xl px-4 py-3.5 transition-all duration-300
                          ${
                            isActive
                              ? "bg-cyan-500/10 border border-cyan-400/20 text-white shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                              : "text-white/40 hover:bg-white/5 hover:text-white hover:translate-x-1"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                          )}

                          <div className="relative flex items-center justify-center">
                            <item.icon
                              className={`h-5 w-5 shrink-0 transition-all duration-300
                            ${isActive ? "text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-white/40 group-hover:text-white group-hover:scale-110"}`}
                            />
                          </div>

                          {!collapsed && (
                            <span
                              className={`truncate text-[14px] tracking-wide transition-all duration-300 ${isActive ? "font-bold text-white" : "font-medium"}`}
                            >
                              {item.title}
                            </span>
                          )}

                          {!collapsed && isActive && (
                            <div className="ml-auto">
                              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)] animate-pulse" />
                            </div>
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
      <SidebarFooter className="p-4 bg-transparent mt-auto">
        {!collapsed ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-4 border border-white/10 shadow-xl group/user overflow-hidden transition-all duration-300 hover:border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative group/avatar">
                <AvatarBadge
                  user={displayUser}
                  size="sm"
                  showRole={false}
                  className="ring-2 ring-white/10 group-hover/user:ring-cyan-500/50 transition-all duration-500"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#1a1f2e] group-hover/user:scale-110 transition-transform" />
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="truncate text-sm font-bold text-white font-display tracking-tight group-hover/user:text-cyan-100 transition-colors">
                  {displayUser.name}
                </span>
                <span className="truncate text-[9px] uppercase font-bold text-cyan-400/60 tracking-widest flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-cyan-400/60" />
                  {displayUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 w-full mt-1 rounded-xl py-2 text-xs font-bold text-white/40 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 group/logout"
            >
              <LogOut className="h-3.5 w-3.5 transition-transform group-hover/logout:-translate-x-1" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 bg-white/5 rounded-2xl border border-white/10">
            <AvatarBadge
              user={displayUser}
              size="sm"
              showRole={false}
              className="ring-2 ring-white/10 hover:ring-cyan-500/50 transition-all"
            />
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl p-3 text-white/20 transition-all hover:bg-rose-500/20 hover:text-rose-400 border border-transparent hover:border-rose-500/20"
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
