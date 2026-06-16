export default function OrderLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-white">
      <section className="mx-auto max-w-450 px-6 py-10">
        <div className="h-9 w-28 rounded bg-gray-200" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="space-y-8">
            {/* OrderProgressSteps skeleton */}
            <div className="relative">
              <div className="absolute top-5 right-[12.5%] left-0 h-px bg-gray-200" />
              <div className="grid grid-cols-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-200 sm:size-11" />
                  <div className="h-4 w-12 rounded bg-gray-200" />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-200 sm:size-11" />
                  <div className="h-4 w-14 rounded bg-gray-200" />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-200 sm:size-11" />
                  <div className="h-4 w-12 rounded bg-gray-200" />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-200 sm:size-11" />
                  <div className="h-4 w-14 rounded bg-gray-200" />
                </div>
              </div>
            </div>
            {/* OrderProductSummary skeleton */}
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="mb-3 h-6 w-20 rounded bg-gray-200" />
              <div className="mb-5 h-5 w-32 rounded bg-gray-200" />
              <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
                <div className="aspect-4/3 rounded-md bg-gray-200" />
                <div className="space-y-3 pt-1">
                  <div className="h-6 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="mt-2 h-8 w-1/3 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-8 space-y-2 border-t border-gray-200 pt-6">
                <div className="h-5 w-full rounded bg-gray-200" />
                <div className="h-5 w-full rounded bg-gray-200" />
                <div className="h-5 w-full rounded bg-gray-200" />
                <div className="mt-4 h-6 w-full rounded bg-gray-200" />
              </div>
            </div>
          </div>
          {/* OrderCheckoutPanel skeleton */}
          <aside>
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="space-y-7 divide-y divide-gray-200">
                <div className="pt-0 pb-7">
                  <div className="mb-5 h-5 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
                </div>
                <div className="py-7">
                  <div className="mb-5 h-5 w-24 rounded bg-gray-200" />
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                </div>
                <div className="py-7">
                  <div className="mb-5 h-5 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-7">
                <div className="mb-6 flex items-center justify-between">
                  <div className="h-6 w-24 rounded bg-gray-200" />
                  <div className="h-8 w-28 rounded bg-gray-200" />
                </div>
                <div className="h-14 w-full rounded bg-gray-200" />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
