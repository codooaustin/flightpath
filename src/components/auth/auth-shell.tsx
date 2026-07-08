import Link from "next/link";
import {
  Cloud,
  MapPin,
  Navigation,
  Plane,
  Radio,
  Target,
} from "lucide-react";

const AIRPORTS = ["KPAO", "KSFO", "KLVJ", "KIAH", "KORD"];

function AuthHeroPanel() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-950 via-sky-800 to-cyan-600 p-10 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent, transparent 28px, rgba(255,255,255,0.12) 28px, rgba(255,255,255,0.12) 56px)",
        }}
      />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-white/20"
        viewBox="0 0 800 900"
        fill="none"
        aria-hidden
      >
        <path
          d="M-20 720 C 180 520, 320 680, 520 420 S 860 180, 920 40"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="10 14"
        />
      </svg>

      {AIRPORTS.map((code, index) => (
        <span
          key={code}
          className="pointer-events-none absolute font-mono text-xs font-semibold tracking-widest text-white/15"
          style={{
            top: `${12 + index * 16}%`,
            left: index % 2 === 0 ? "8%" : "72%",
          }}
        >
          {code}
        </span>
      ))}

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Plane className="h-5 w-5 rotate-45 text-white" />
          </span>
          <span className="text-xl font-bold tracking-tight">Flight Path</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-lg space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider ring-1 ring-white/20 backdrop-blur-sm">
          <Radio className="h-3.5 w-3.5" />
          Cleared to land on your dashboard
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
          Every hour logged.
          <br />
          Every milestone mapped.
        </h1>
        <p className="text-base leading-relaxed text-sky-100/90">
          From discovery flight to airline captain — track training hours, complete
          missions, and see your entire aviation career on one flight plan.
        </p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Navigation, label: "Career roadmap" },
            { icon: Target, label: "Training missions" },
            { icon: MapPin, label: "Flight logbook" },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15 backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 shrink-0 text-sky-200" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-sm text-sky-100/80">
        <Cloud className="h-4 w-4" />
        <span>Wind calm · Visibility unlimited · VFR conditions</span>
      </div>
    </div>
  );
}

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="relative hidden w-[min(52%,560px)] shrink-0 lg:block">
        <AuthHeroPanel />
      </aside>

      <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100">
                <Plane className="h-4 w-4 rotate-45 text-sky-600" />
              </span>
              <span className="text-lg font-bold">Flight Path</span>
            </Link>
          </div>

          <div className="mb-8 space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
              Pilot portal
            </p>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8">
            {children}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
