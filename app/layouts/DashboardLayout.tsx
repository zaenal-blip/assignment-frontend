import { Outlet, useNavigate } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";

export default function DashboardLayout() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !user) {
            navigate("/login", { replace: true });
        }
    }, [mounted, user, navigate]);

    if (!mounted || !user) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-dashboard relative overflow-hidden text-white">
                {/* Background Blobs for Futuristic Feel */}
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0 relative z-10">
                    <Topbar />
                    <main className="flex-1 p-4 md:p-6 tv:p-10 overflow-y-auto">
                        <div className="max-w-7xl mx-auto w-full">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}

