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
            <div className="min-h-screen flex w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Topbar />
                    <main className="flex-1 p-4 md:p-6 tv:p-10 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}

