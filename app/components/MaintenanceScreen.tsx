import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Wrench,
  Cpu,
  Zap,
  ShieldCheck,
  Activity,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import bgImage from "@/assets/bg.png";

const TARGET_MS = 1000 * 60 * 60 * 4; // 4 hours countdown

function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = useState(durationMs);
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => (r > 1000 ? r - 1000 : durationMs));
    }, 1000);
    return () => clearInterval(id);
  }, [durationMs]);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

export default function Maintenance() {
  const navigate = useNavigate();
  const { h, m, s } = useCountdown(TARGET_MS);
  const [progress, setProgress] = useState(38);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 92 ? 38 : p + 1));
    }, 800);
    return () => clearInterval(id);
  }, []);

  const improvements = [
    {
      icon: Cpu,
      title: "AI Engine Upgrade",
      desc: "Migrasi engine prediksi assignment ke model v2.3",
    },
    {
      icon: Activity,
      title: "Realtime Monitoring",
      desc: "Optimasi performa dashboard & live progress tracking",
    },
    {
      icon: ShieldCheck,
      title: "Security Patch",
      desc: "Penguatan sistem otentikasi & enkripsi data",
    },
    {
      icon: Sparkles,
      title: "UI/UX Refinement",
      desc: "Peningkatan visual dan interaksi pada modul tugas",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-[hsl(220_45%_5%/0.78)]" />
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[hsl(190_100%_50%/0.18)] blur-3xl aura-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[hsl(210_100%_50%/0.18)] blur-3xl aura-pulse" />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(190 100% 70%) 1px, transparent 1px), linear-gradient(90deg, hsl(190 100% 70%) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {/* Brand */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[hsl(190_100%_50%/0.4)] blur-xl aura-pulse" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(190_100%_60%/0.5)] bg-[hsl(220_40%_8%/0.7)]">
              <Wrench className="h-6 w-6 text-[hsl(190_100%_70%)] aura-icon-glow" />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[hsl(190_60%_75%)]">
              AURA · Industry 4.0
            </p>
            <h2 className="text-lg font-semibold text-[hsl(190_30%_98%)] aura-text-glow">
              System Maintenance
            </h2>
          </div>
        </div>

        {/* Main Card */}
        <div className="aura-glass w-full max-w-3xl rounded-2xl p-8 md:p-12">
          {/* Status pill */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(38_100%_60%/0.5)] bg-[hsl(38_100%_50%/0.1)] px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[hsl(38_100%_70%)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(38_100%_60%)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(38_100%_60%)]" />
              </span>
              In Progress · System Upgrading
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-center text-4xl md:text-5xl font-bold tracking-tight text-[hsl(190_30%_98%)] aura-text-glow">
            We&apos;re Boosting{" "}
            <span className="text-[hsl(190_100%_70%)]">AURA</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm md:text-base text-[hsl(190_20%_80%)]">
            Sistem sedang dalam perbaikan dan peningkatan untuk memberikan
            pengalaman manajemen yang lebih cepat, aman, dan cerdas. Mohon
            kembali sebentar lagi.
          </p>

          {/* Countdown */}
          <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
            {[
              { label: "Hours", value: h },
              { label: "Minutes", value: m },
              { label: "Seconds", value: s },
            ].map((b) => (
              <div
                key={b.label}
                className="rounded-xl border border-[hsl(190_100%_60%/0.25)] bg-[hsl(220_40%_6%/0.6)] p-4 text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-[hsl(190_100%_75%)] aura-text-glow tabular-nums">
                  {b.value}
                </div>
                <div className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.25em] text-[hsl(190_30%_70%)]">
                  {b.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-[hsl(190_30%_75%)]">
              <span className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[hsl(190_100%_70%)] aura-icon-glow" />
                Upgrade Progress
              </span>
              <span className="text-[hsl(190_100%_75%)] font-semibold">
                {progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(220_40%_10%)] border border-[hsl(190_100%_60%/0.2)]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, hsl(210 100% 50%), hsl(190 100% 60%))",
                  boxShadow: "0 0 12px hsl(190 100% 60% / 0.7)",
                }}
              />
            </div>
          </div>

          {/* Improvements */}
          <div className="mt-10">
            <p className="mb-4 text-center text-xs uppercase tracking-[0.3em] text-[hsl(190_60%_75%)]">
              What&apos;s Being Improved
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {improvements.map((it) => (
                <div
                  key={it.title}
                  className="group flex gap-3 rounded-xl border border-[hsl(190_100%_60%/0.2)] bg-[hsl(220_40%_8%/0.5)] p-4 transition-all hover:border-[hsl(190_100%_60%/0.5)] hover:bg-[hsl(220_40%_10%/0.7)]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[hsl(190_100%_60%/0.3)] bg-[hsl(220_40%_6%/0.7)] transition-transform group-hover:scale-110">
                    <it.icon className="h-5 w-5 text-[hsl(190_100%_70%)] aura-icon-glow" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[hsl(190_30%_95%)]">
                      {it.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[hsl(190_20%_75%)]">
                      {it.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(190_100%_60%/0.3)] bg-[hsl(220_40%_8%/0.6)] px-5 py-2.5 text-sm font-medium text-[hsl(190_30%_90%)] transition-all hover:border-[hsl(190_100%_60%/0.6)] hover:bg-[hsl(220_40%_12%/0.7)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="aura-btn-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </button>
          </div>

          {/* Footer status */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[hsl(190_100%_60%/0.15)] pt-5 text-xs text-[hsl(190_30%_70%)]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(142_71%_55%)] shadow-[0_0_8px_hsl(142_71%_55%)]" />
              Database · Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(38_100%_60%)] shadow-[0_0_8px_hsl(38_100%_60%)]" />
              API Gateway · Upgrading
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(142_71%_55%)] shadow-[0_0_8px_hsl(142_71%_55%)]" />
              Auth Service · Online
            </span>
          </div>
        </div>

        <p className="mt-6 text-xs text-[hsl(190_20%_70%)]">
          © {new Date().getFullYear()} Zaenal Arifin Production System · Need
          help?{" "}
          <a
            href="mailto:[arfnworks@gmail.com]"
            className="text-[hsl(190_100%_70%)] hover:underline"
          >
            arfnworks@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
