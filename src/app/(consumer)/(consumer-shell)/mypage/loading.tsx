export default function MypageLoading() {
  return (
    <main className="flex-1 animate-pulse bg-white">
      <div className="mx-auto grid max-w-450 grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)]">
        {/* Mobile tab skeleton */}
        <div className="flex border-b border-gray-200 px-2 lg:hidden">
          <div className="h-14 w-24 border-b-2 border-gray-200 px-4" />
          <div className="h-14 w-24 px-4" />
        </div>

        {/* Desktop sidebar skeleton */}
        <div className="hidden border-r border-gray-200 px-10 py-10 lg:block">
          <div className="h-7 w-24 rounded bg-gray-200" />
          <div className="mt-6 space-y-2">
            <div className="h-12 rounded-md bg-gray-200" />
            <div className="h-12 rounded-md bg-gray-200" />
            <div className="h-12 rounded-md bg-gray-200" />
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="h-5 w-16 rounded bg-gray-200" />
            <div className="mt-4 space-y-2">
              <div className="h-12 rounded-md bg-gray-200" />
              <div className="h-12 rounded-md bg-gray-200" />
              <div className="h-12 rounded-md bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <section className="px-5 py-10 lg:px-10">
          <div className="max-w-320 space-y-6">
            {/* Header */}
            <div className="mb-8">
              <div className="h-9 w-24 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-64 rounded bg-gray-200" />
            </div>

            {/* Account info card */}
            <div className="rounded-lg border border-gray-200 p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="h-6 w-20 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-48 rounded bg-gray-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-24 rounded-md bg-gray-200" />
                  <div className="h-10 w-24 rounded-md bg-gray-200" />
                </div>
              </div>
              <div className="mt-7 flex items-center gap-8">
                <div className="size-32 shrink-0 rounded-full bg-gray-200" />
                <div className="w-full max-w-80 space-y-2">
                  <div className="h-8 w-40 rounded bg-gray-200" />
                  <div className="h-5 w-32 rounded bg-gray-200" />
                  <div className="h-5 w-48 rounded bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Account management card */}
            <div className="rounded-lg border border-gray-200 p-7">
              <div className="h-6 w-24 rounded bg-gray-200" />
              <div className="mt-6 flex items-center gap-4">
                <div className="size-12 shrink-0 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-5 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-48 rounded bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Help section card */}
            <div className="rounded-lg border border-gray-200 p-7">
              <div className="h-6 w-36 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-52 rounded bg-gray-200" />
              <div className="mt-6 flex gap-3">
                <div className="h-11 w-36 rounded-md bg-gray-200" />
                <div className="h-11 w-36 rounded-md bg-gray-200" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
