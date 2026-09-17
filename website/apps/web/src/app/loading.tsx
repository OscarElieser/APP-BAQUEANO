/**
 * WHY
 * Prevents empty public screens while route data resolves.
 *
 * HOW
 * Renders stable skeleton bands with reserved dimensions.
 *
 * WHAT
 * Public loading state.
 */
export default function LoadingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-white/10" />
      <div className="mt-6 h-20 max-w-3xl animate-pulse rounded-md bg-white/10" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-md bg-white/10" />)}
      </div>
    </main>
  );
}
