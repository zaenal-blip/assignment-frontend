import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

interface ModalFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
}

export function ModalForm({ open, onOpenChange, title, children }: ModalFormProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="glass-darker border-white/10 text-white">
                    <DrawerHeader className="border-b border-white/5 pb-4">
                        <DrawerTitle className="text-xl font-bold font-display text-glow tracking-tight">
                            {title}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="px-6 py-8">{children}</div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl glass-darker border-white/10 text-white shadow-2xl overflow-hidden p-0">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <DialogHeader className="px-8 py-6 border-b border-white/5 relative bg-white/5">
                    <DialogTitle className="text-2xl font-bold font-display text-glow tracking-tight uppercase">
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="px-8 py-8 relative">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
