export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-text-2">
        Stage 0 · Foundations
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">WINTRARC</h1>
      <p className="text-lg text-text-2">
        Become the person you said you&apos;d be.
      </p>
      <p className="max-w-prose text-sm leading-6 text-text-2">
        Sign-in, the Today screen and your habits arrive in the next stages.
        This deployment currently proves the build, the database connection and
        push delivery.
      </p>
      <p>
        <a
          href="/api/health"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm hover:bg-card-elevated"
        >
          Check system health
        </a>
      </p>
    </main>
  );
}
