import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getStoredUser, updateProfile } from "@/lib/api";
import { useUser } from "@/hooks/use-user";
import { User, Camera, Lock, User as UserIcon, Mail, CheckCircle2 } from "lucide-react";

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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-[#1e3a5f]">User Profile</h1>
                <p className="text-muted-foreground">View and update your profile information and security details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <Card className="md:col-span-1 h-fit border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardContent className="pt-8 flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                                {previewUrl ? (
                                    <AvatarImage src={previewUrl} className="object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-[#1e3a5f] text-white text-3xl font-bold">
                                        {user.avatar}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Camera className="text-white h-8 w-8" />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange}
                            />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-[#1e3a5f]">{user.name}</h2>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold uppercase tracking-wider">
                            <UserIcon className="h-3 w-3" />
                            {user.role}
                        </span>
                        <div className="w-full mt-8 border-t border-slate-100 pt-6 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Verified Account</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Card */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleUpdateProfile}>
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-[#1e3a5f]" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>Update your name and email address.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input 
                                            id="name" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value.toUpperCase())}
                                            placeholder="Enter your full name" 
                                            className="focus-visible:ring-[#1e3a5f]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com" 
                                            className="focus-visible:ring-[#1e3a5f]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            
                            <CardHeader className="pt-0">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-[#1e3a5f]" />
                                    Security
                                </CardTitle>
                                <CardDescription>Change your password. Leave blank if you don't want to change it.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input 
                                            id="password" 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="focus-visible:ring-[#1e3a5f]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm Password</Label>
                                        <Input 
                                            id="confirm-password" 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="focus-visible:ring-[#1e3a5f]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end p-6 bg-slate-50/50 rounded-b-xl border-t border-slate-100 mt-2">
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-8"
                                >
                                    {loading ? "Saving Changes..." : "Save Changes"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
}
