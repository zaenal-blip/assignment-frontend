import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getStoredUser, updateProfile } from "@/lib/api";
import { useUser } from "@/hooks/use-user";
import { User, Camera, Lock, User as UserIcon, Mail, CheckCircle2, ShieldCheck, Cpu, ArrowRight } from "lucide-react";

export default function ProfilePage() {
    const { toast } = useToast();
    const { user, refreshUser } = useUser();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPreviewUrl(user.avatar);
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            
            if (password) {
                if (password !== confirmPassword) {
                    toast({
                        title: "Error",
                        description: "Passwords do not match",
                        variant: "destructive",
                    });
                    setLoading(false);
                    return;
                }
                formData.append("password", password);
            }

            if (fileInputRef.current?.files?.[0]) {
                formData.append("avatar", fileInputRef.current.files[0]);
            }

            await updateProfile(formData);
            
            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
            
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in-up px-2 pb-12">
            {/* Page Header */}
            <div className="flex flex-col gap-2 px-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-white font-display text-glow">
                    Personnel profile
                </h1>
                <p className="text-sm text-white/40 font-medium tracking-wide uppercase">
                    Operator Identity & Access Authorization
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-8 rounded-[2.5rem] border-none relative overflow-hidden flex flex-col items-center">
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
                        
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                            <Avatar className="h-40 w-40 border-4 border-white/5 shadow-2xl relative">
                                {previewUrl ? (
                                    <AvatarImage src={previewUrl} className="object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-slate-800 to-black text-white text-4xl font-black">
                                        {user.name.charAt(0)}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                <Camera className="text-white h-10 w-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="mt-8 text-center space-y-4 w-full">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-white font-display tracking-tight text-glow uppercase">{user.name}</h2>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="px-3 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                                        {user.role}
                                    </span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Operator</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-4 text-white/40 group hover:text-white/70 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-white/40 group hover:text-white/70 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-medium">Verified Account</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-[2rem] border-none space-y-4">
                        <div className="flex items-center gap-3 text-white/60">
                            <Cpu className="h-4 w-4 text-cyan-400" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">System Status</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/30">
                                <span>Network Uplink</span>
                                <span className="text-emerald-400">Stable</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Panels */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        {/* Personal Info Panel */}
                        <div className="glass p-8 md:p-10 rounded-[2.5rem] border-none space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <UserIcon className="h-32 w-32 text-white" />
                            </div>
                            
                            <div className="space-y-1 relative">
                                <h3 className="text-xl font-bold text-white font-display tracking-tight uppercase flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                    Personal Protocol
                                </h3>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-5">Core identity parameters</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Legal Identifier</Label>
                                    <Input 
                                        id="name" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value.toUpperCase())}
                                        placeholder="Enter legal identifier..." 
                                        className="h-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-cyan-500/30"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Comms Interface (Email)</Label>
                                    <Input 
                                        id="email" 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="operator@system.com" 
                                        className="h-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-cyan-500/30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Panel */}
                        <div className="glass p-8 md:p-10 rounded-[2.5rem] border-none space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Lock className="h-32 w-32 text-white" />
                            </div>

                            <div className="space-y-1 relative">
                                <h3 className="text-xl font-bold text-white font-display tracking-tight uppercase flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                    Security Override
                                </h3>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-5">Access token reconfiguration</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">New Access Keyword</Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••" 
                                        className="h-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-blue-500/30"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Confirm Keyword</Label>
                                    <Input 
                                        id="confirm-password" 
                                        type="password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••" 
                                        className="h-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-blue-500/30"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white font-black rounded-2xl h-14 px-12 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 group"
                            >
                                {loading ? "Executing Sync..." : "Commit Protocol Updates"}
                                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
