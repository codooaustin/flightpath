import Link from "next/link";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

const runwaySamples = ["09L", "27R", "18C", "36", "0123456789"];
const taxiwaySamples = [
  "A",
  "B",
  "C",
  "EXIT",
  "HOLD",
  "ILS",
  "RWY 27",
  "TAXI",
];

export default function FontPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-400" />
            <span className="font-semibold">Flight Path</span>
          </Link>
          <Button
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            render={<Link href="/dashboard" />}
          >
            Back to app
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Open Runway Fonts</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Preview fonts from{" "}
            <a
              href="https://github.com/ryo-a/Open-Runway-Fonts"
              className="text-sky-400 underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              ryo-a/Open-Runway-Fonts
            </a>
            . ICAO Annex 14–inspired runway and taxiway markings (CC0 / SIL OFL).
          </p>
        </div>

        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <h2 className="font-semibold text-amber-200">Font loading note</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            If the runway samples looked like Times New Roman serifs, that was a
            CSS bug — the custom font wasn&apos;t being applied and the browser
            fell back to its default serif. The samples below should now match
            the clean ICAO-style glyphs shown in the{" "}
            <a
              href="https://github.com/ryo-a/Open-Runway-Fonts/blob/main/img/open-runway-numbers.png"
              className="text-sky-400 underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              GitHub preview
            </a>
            .
          </p>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-sky-300">Open Runway Numbers</h2>
            <p className="text-sm text-slate-400">
              Runway designation markings — digits 0–9 and L, C, R
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#2a2a2a] shadow-2xl">
            <div className="border-b border-white/10 bg-[#1f1f1f] px-4 py-2 text-xs uppercase tracking-widest text-slate-500">
              Runway surface preview
            </div>
            <div className="space-y-8 p-8 md:p-12">
              {runwaySamples.map((sample) => (
                <div key={sample} className="space-y-3">
                  <p
                    className="font-runway text-center text-6xl tracking-[0.35em] text-white md:text-8xl"
                  >
                    {sample}
                  </p>
                  <p className="text-center font-sans text-xs text-slate-500">
                    Geist (default): {sample}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-amber-300">
              Open Taxiway Mandatory Sign
            </h2>
            <p className="text-sm text-slate-400">
              Mandatory instruction markings — A–Z, 0–9, and symbols
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {taxiwaySamples.map((sample) => (
              <div
                key={sample}
                className="flex min-h-28 flex-col items-center justify-center rounded-lg border-2 border-yellow-400 bg-black px-4 py-6"
              >
                <p className="font-taxiway text-center text-3xl leading-none text-yellow-400 md:text-4xl">
                  {sample}
                </p>
                <p className="mt-3 font-sans text-[10px] uppercase tracking-wider text-yellow-400/50">
                  {sample}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
            <p className="font-medium text-slate-300">Character notes</p>
            <p className="mt-1">
              Roman numerals use alternate keys: Ⅰ as !, Ⅱ as @, Ⅲ as #. Arrows:
              ← a, ↑ w, → d, ↓ s.
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">In-context mockup</h2>
          <p className="text-sm text-slate-400">
            How runway numbers might look in the Flight Path brand.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-sky-400" />
              <span className="font-runway text-4xl text-white">
                09L
              </span>
            </div>
            <div>
              <p className="font-sans text-2xl font-bold">Flight Path</p>
              <p className="font-taxiway text-sm text-sky-300">
                RWY 27 / TAXI A
              </p>
            </div>
          </div>
        </section>

        <p className="text-xs text-slate-500">
          Fonts by ryo-a. Not intended for actual aircraft or airport operations.
          Licensed under CC0 and SIL Open Font License.
        </p>
      </main>
    </div>
  );
}
