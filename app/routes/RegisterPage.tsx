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
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/lib/api";
import background from "../assets/bg.png";
import { useUser } from "@/hooks/use-user";

export default function Register() {
  const [name, setName] = useState("");
  const [noReg, setNoReg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleNoRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 7);
    setNoReg(value);
    if (errors.noReg && value.length === 7) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.noReg;
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
    if (errors.phone && value.length >= 10) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Nama harus diisi";
    if (noReg.length !== 7) newErrors.noReg = "Nomor registrasi harus 7 angka";
    if (!email.trim()) newErrors.email = "Email harus diisi";
    if (phone.length < 10)
      newErrors.phone = "Nomor telepon harus minimal 10 angka";
    if (password.length < 6)
      newErrors.password = "Password harus minimal 6 karakter";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Password tidak cocok";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await register({
        name,
        email,
        noReg,
        noHp: phone,
        role: "MEMBER",
        password,
        confirmPassword,
      });
      toast({
        title: "Registrasi berhasil",
        description: "Silakan login dengan akun Anda",
      });
      navigate("/login");
    } catch (error: any) {
      let errorMessage = "Terjadi kesalahan saat mendaftar";
      if (error?.message) errorMessage = error.message;
      else if (typeof error === "string") errorMessage = error;
      toast({
        title: "Registrasi gagal",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 relative overflow-hidden"
      //className="flex min-h-screen items-center justify-center lg:justify-end lg:pr-16 bg-cover bg-center bg-no-repeat px-4 py-12 relative overflow-hidden"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <Card className="w-full max-w-lg relative z-10 border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <CardHeader className="space-y-2 text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner group transition-all duration-300 hover:scale-110">
            <UserPlus className="h-8 w-8 text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            Daftar Akun
          </CardTitle>
          <CardDescription className="text-white/70 font-medium">
            Bergabung dengan TPS Assignment Board
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1"
                >
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  required
                  className={`h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all rounded-xl ${errors.name ? "border-red-400" : ""}`}
                />
                {errors.name && (
                  <p className="text-[10px] font-bold text-red-400 px-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="noReg"
                  className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1"
                >
                  Nomor Registrasi (7 Angka)
                </Label>
                <Input
                  id="noReg"
                  type="text"
                  inputMode="numeric"
                  placeholder="2538600"
                  maxLength={7}
                  value={noReg}
                  onChange={handleNoRegChange}
                  required
                  className={`h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all rounded-xl ${errors.noReg ? "border-red-400" : ""}`}
                />
                {errors.noReg && (
                  <p className="text-[10px] font-bold text-red-400 px-1">
                    {errors.noReg}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-email"
                className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1"
              >
                Email
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all rounded-xl ${errors.email ? "border-red-400" : ""}`}
              />
              {errors.email && (
                <p className="text-[10px] font-bold text-red-400 px-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1"
              >
                Nomor Telepon
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
                  +62
                </span>
                <Input
                  id="phone"
                  type="text"
                  inputMode="numeric"
                  placeholder="8123456789"
                  maxLength={15}
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  className={`h-11 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all rounded-xl ${errors.phone ? "border-red-400" : ""}`}
                />
              </div>
              {errors.phone && (
                <p className="text-[10px] font-bold text-red-400 px-1">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="reg-password"
                  className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all rounded-xl ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-400 px-1">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-password"
                  className="text-xs font-bold uppercase tracking-wider text-white/70 ml-1"
                >
                  Konfirmasi
                </Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all rounded-xl ${errors.confirmPassword ? "border-red-400" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] font-bold text-red-400 px-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-white text-blue-950 hover:bg-white/90 hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl shadow-lg mt-4"
            >
              Daftar Sekarang
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/60">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="font-bold text-white hover:underline decoration-white/30 underline-offset-4 transition-all"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="absolute top-[5%] left-[5%] w-72 h-72 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[5%] w-72 h-72 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
