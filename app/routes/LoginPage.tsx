import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/api";
import background from "../assets/bg.png";
import { useUser } from "@/hooks/use-user";

export default function Login() {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ identifier: email, password });
      toast({
        title: "Login berhasil",
        description: "Selamat datang kembali!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login gagal",
        description: "Email atau password salah",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative overflow-hidden"
      //className="flex min-h-screen items-center justify-center lg:justify-end lg:pr-24 bg-cover bg-center bg-no-repeat px-4 relative overflow-hidden"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <Card className="w-full max-w-md relative z-10 border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <CardHeader className="space-y-2 text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner group transition-all duration-300 hover:scale-110">
            <LogIn className="h-8 w-8 text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            TPS Board
          </CardTitle>
          <CardDescription className="text-white/70 font-medium">
            Masuk ke akun Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold tracking-wide text-white/90 ml-1"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all duration-200 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold tracking-wide text-white/90 ml-1"
              >
                Password
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all duration-200 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-bold bg-white text-blue-950 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/60">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-bold text-white hover:underline decoration-white/30 underline-offset-4 transition-all"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Decorative elements */}
      <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
