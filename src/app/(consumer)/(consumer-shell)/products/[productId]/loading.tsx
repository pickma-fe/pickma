export default function ProductDetailLoading() {
  return (
    <main className="flex-1 animate-pulse bg-white">
      <section className="mx-auto grid max-w-450 gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="flex flex-col gap-8">
          <div className="grid gap-8 xl:grid-cols-[560px_minmax(0,1fr)]">
            <div className="aspect-square w-full rounded-xl bg-gray-200" />

            <div className="flex flex-col gap-4 pt-2">
              <div className="h-7 w-2/3 rounded bg-gray-200" />
              <div className="h-5 w-1/2 rounded bg-gray-200" />
              <div className="mt-2 h-9 w-1/3 rounded bg-gray-200" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          {/* ProductDetailTabs skeleton */}
          <div>
            <div className="flex gap-2 border-b border-gray-200">
              <div className="h-9 w-16 rounded-t bg-gray-200" />
              <div className="h-9 w-24 rounded-t bg-gray-200" />
            </div>
            <div className="space-y-6 py-8">
              <div>
                <div className="mb-4 h-5 w-20 rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-gray-200 p-6">
            <div className="mb-4 h-6 w-1/2 rounded bg-gray-200" />
            <div className="mb-3 h-12 w-full rounded bg-gray-200" />
            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="h-12 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-200" />
            </div>
            <div className="mb-6 h-8 w-28 rounded bg-gray-200" />
            <div className="h-12 w-full rounded bg-gray-200" />
          </div>
        </aside>
      </section>
    </main>
  );
}
