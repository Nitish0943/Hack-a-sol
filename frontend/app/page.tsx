import { StatusCard } from "@/components/status-card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-10 sm:py-16">
      <header className="flex items-center justify-between border-b border-[var(--line)] pb-5">
        <p className="text-sm font-semibold tracking-wide text-[var(--accent)]">
          FULL-STACK STARTER
        </p>
        <span className="text-xs text-[var(--muted)]">Development environment</span>
      </header>

      <section className="grid flex-1 content-center gap-10 py-14 md:grid-cols-[1fr_0.85fr] md:items-center">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-medium text-[var(--muted)]">
            Next.js + FastAPI
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your stack is ready to build.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">
            The frontend is checking the versioned API and will report its live
            connection state here.
          </p>
        </div>
        <StatusCard />
      </section>

      <footer className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--line)] pt-5 text-xs text-[var(--muted)]">
        <span>Frontend :3000</span>
        <span>API :8000</span>
        <a className="underline underline-offset-4" href="http://localhost:8000/docs">
          OpenAPI docs
        </a>
      </footer>
    </main>
  );
}