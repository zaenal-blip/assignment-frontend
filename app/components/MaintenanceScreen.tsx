import { Wrench, Cog, AlertCircle } from "lucide-react";

export function MaintenanceScreen() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
            {/* Background glowing elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[150px]" />
            </div>

            <div className="z-10 flex flex-col items-center space-y-8 max-w-lg w-full bg-card/60 backdrop-blur-xl border border-border/50 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <div className="relative bg-background/80 p-5 rounded-2xl border border-border shadow-inner flex items-center justify-center">
                        <Cog className="w-16 h-16 text-primary animate-[spin_4s_linear_infinite]" />
                        <Wrench className="w-10 h-10 text-muted-foreground absolute -bottom-2 -right-2 animate-bounce" />
                    </div>
                </div>

                <div className="space-y-4 w-full">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        System Maintenance
                    </h1>
                    
                    <div className="flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full text-sm font-medium border border-amber-500/20 w-fit mx-auto">
                        <AlertCircle className="w-4 h-4" />
                        <span>Upgrades in Progress</span>
                    </div>
                    
                    <p className="text-muted-foreground text-lg leading-relaxed pt-2">
                        We are currently performing scheduled maintenance and system improvements to provide you with a better, faster experience.
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                        Please check back shortly. Thank you for your patience!
                    </p>
                </div>

                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-4 relative">
                    <div className="h-full bg-primary rounded-full w-1/3 shadow-[0_0_10px_2px_rgba(var(--primary),0.5)] sliding-bar" />
                </div>
            </div>

            {/* Injected style for a simple smooth slide animation */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes custom-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
                .sliding-bar {
                    animation: custom-slide 2.5s ease-in-out infinite alternate;
                }
            `}} />
        </div>
    );
}
