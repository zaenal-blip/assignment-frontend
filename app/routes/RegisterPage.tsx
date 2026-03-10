import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";

const roles = ["Admin", "Leader", "SPV", "DPH", "Member"] as const;

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "",
    });

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(213,52%,24%)] via-[hsl(213,52%,18%)] to-[hsl(220,26%,14%)]">
            <Card className="w-full max-w-md shadow-2xl border-0">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Shield className="h-8 w-8" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                        <CardDescription className="mt-1">Register for TPS Board</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Ahmad Rizki" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg-email">Email</Label>
                            <Input id="reg-email" type="email" placeholder="you@company.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="+62 812 3456 7890" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg-password">Password</Label>
                            <Input id="reg-password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => handleChange("password", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={form.role} onValueChange={(v) => handleChange("role", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full h-11">Register</Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary font-medium hover:underline">Back to Login</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
