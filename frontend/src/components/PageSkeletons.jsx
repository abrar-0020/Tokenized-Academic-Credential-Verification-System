const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-[#252626] ${className}`.trim()} />
);

const SkeletonLine = ({ className = '' }) => (
  <div className={`animate-pulse rounded-full bg-[#252626] ${className}`.trim()} />
);

export const DashboardSkeleton = () => (
  <div className="space-y-8" aria-busy="true" role="status">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-[#131313] p-8 rounded-lg border border-[#484848]/20 overflow-hidden">
          <div className="flex items-start justify-between mb-6">
            <SkeletonBlock className="h-16 w-16 rounded-2xl" />
            <SkeletonBlock className="h-20 w-20 rounded-full opacity-40" />
          </div>
          <SkeletonLine className="h-3 w-44 mb-4 opacity-70" />
          <SkeletonLine className="h-10 w-28" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 bg-[#131313] rounded-lg p-6 border border-[#484848]/20">
        <div className="flex items-center justify-between mb-8">
          <SkeletonLine className="h-6 w-52" />
          <SkeletonLine className="h-4 w-28" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr] gap-4 py-4 border-t border-[#484848]/10">
              <SkeletonLine className="h-4 w-40" />
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="h-4 w-24" />
              <SkeletonLine className="h-5 w-20 justify-self-end" />
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#131313] rounded-lg p-6 border border-[#484848]/20">
          <SkeletonLine className="h-5 w-32 mb-6" />
          <div className="space-y-4">
            <SkeletonLine className="h-3 w-full" />
            <SkeletonBlock className="h-2.5 w-full rounded-full" />
            <div className="flex justify-between">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-3 w-12" />
            </div>
          </div>
        </div>

        <div className="bg-[#1f2020] rounded-lg p-6 border border-[#484848]/20">
          <SkeletonLine className="h-5 w-32 mb-3" />
          <SkeletonLine className="h-4 w-full mb-2" />
          <SkeletonLine className="h-4 w-5/6 mb-6" />
          <SkeletonBlock className="h-12 w-full rounded-md" />
        </div>

        <div className="bg-[#131313] rounded-lg p-4 border border-[#484848]/20">
          <SkeletonLine className="h-3 w-28 mb-3" />
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-8 w-24 rounded-md" />
            <SkeletonBlock className="h-8 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const HistorySkeleton = () => (
  <div className="space-y-8" aria-busy="true" role="status">
    <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8">
      <div className="md:w-2/3 space-y-4">
        <SkeletonLine className="h-12 w-3/4" />
        <SkeletonLine className="h-4 w-full max-w-lg" />
        <SkeletonLine className="h-4 w-5/6 max-w-md" />
      </div>
      <div className="space-y-3 w-full md:w-64">
        <SkeletonBlock className="h-11 w-full rounded-lg" />
        <SkeletonLine className="h-3 w-40 ml-auto" />
      </div>
    </div>

    <div className="bg-[#131313] rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-[#484848]/20">
      <div className="overflow-x-auto">
        <div className="min-w-[900px] p-6 space-y-4">
          <div className="grid grid-cols-[0.8fr_1.2fr_1.2fr_1fr_0.6fr_0.5fr] gap-4 pb-4 border-b border-[#484848]/10">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLine key={index} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-[0.8fr_1.2fr_1.2fr_1fr_0.6fr_0.5fr] gap-4 py-4 border-b border-[#484848]/10 items-center">
              <SkeletonLine className="h-4 w-24" />
              <SkeletonLine className="h-4 w-44" />
              <SkeletonLine className="h-4 w-36" />
              <SkeletonLine className="h-4 w-32" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
              <SkeletonBlock className="h-8 w-8 rounded-lg justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-[#131313] p-6 rounded-xl border border-[#484848]/10">
          <SkeletonBlock className="h-10 w-10 rounded-lg mb-4" />
          <SkeletonLine className="h-5 w-40 mb-3" />
          <SkeletonLine className="h-4 w-full mb-2" />
          <SkeletonLine className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  </div>
);

export const VerifySkeleton = () => (
  <div className="space-y-8" aria-busy="true" role="status">
    <div className="bg-[#131313] rounded-xl p-8 border border-[#484848]/20">
      <div className="space-y-3 mb-8">
        <SkeletonLine className="h-12 w-3/4" />
        <SkeletonLine className="h-4 w-full max-w-xl" />
      </div>
      <SkeletonBlock className="h-16 w-full rounded-lg mb-6" />
      <SkeletonBlock className="h-12 w-44 rounded-md" />
    </div>

    <div className="bg-[#1f2020] rounded-xl p-8 border border-[#484848]/20 min-h-[360px] space-y-8">
      <div className="flex justify-between items-start">
        <SkeletonBlock className="h-10 w-48 rounded-lg" />
        <SkeletonBlock className="h-12 w-12 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonLine className="h-3 w-24" />
            <SkeletonLine className="h-5 w-36" />
          </div>
        ))}
      </div>
      <div className="pt-6 border-t border-[#484848]/20 space-y-3">
        <SkeletonLine className="h-3 w-28" />
        <SkeletonLine className="h-4 w-full" />
      </div>
    </div>
  </div>
);

export const PublicVerifySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-busy="true" role="status">
    <div className="md:col-span-2 space-y-6">
      <div className="bg-[#1f2020] rounded-xl p-8 min-h-[360px] border border-[#484848]/10 space-y-8">
        <div className="flex justify-between items-start">
          <SkeletonBlock className="h-10 w-48 rounded-lg" />
          <SkeletonBlock className="h-10 w-28 rounded-full" />
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonLine className="h-3 w-24" />
                <SkeletonLine className="h-5 w-32" />
              </div>
            ))}
          </div>
          <div>
            <SkeletonLine className="h-3 w-28 mb-2" />
            <SkeletonLine className="h-4 w-full" />
          </div>
        </div>
      </div>

      <div className="bg-[#111111] rounded-xl p-8 border border-[#1F1F1F] shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <SkeletonBlock className="h-36 w-36 rounded-lg flex-shrink-0" />
          <div className="flex-1 w-full space-y-4">
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-5/6" />
            <SkeletonBlock className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <div className="bg-[#131313] rounded-xl p-6 border border-[#484848]/20">
        <SkeletonLine className="h-5 w-36 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
      <SkeletonBlock className="h-36 rounded-xl" />
    </div>
  </div>
);

export const IssueCredentialSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" aria-busy="true" role="status">
    <div className="lg:col-span-7 space-y-10">
      <div className="space-y-4">
        <SkeletonLine className="h-14 w-3/4" />
        <SkeletonLine className="h-4 w-full max-w-md" />
      </div>

      <div className="flex gap-4 items-center max-w-sm">
        <SkeletonBlock className="h-[2px] flex-1 rounded-none" />
        <SkeletonBlock className="h-[2px] flex-1 rounded-none opacity-50" />
        <SkeletonBlock className="h-[2px] flex-1 rounded-none opacity-30" />
      </div>

      <div className="space-y-12">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <section key={sectionIndex} className="space-y-8">
            <div className="flex items-center gap-4">
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="h-5 w-36" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  <SkeletonLine className="h-3 w-28" />
                  <SkeletonBlock className="h-12 w-full rounded-none border-b border-[#484848]/30 bg-[#131313]" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="pt-4 flex items-center justify-between">
        <SkeletonLine className="h-6 w-24" />
        <SkeletonBlock className="h-14 w-44 rounded-md" />
      </div>
    </div>

    <div className="lg:col-span-5 sticky top-32">
      <div className="relative group">
        <div className="absolute -inset-4 bg-[#8197ff]/5 rounded-[2rem] blur-3xl" />
        <div className="relative bg-[#1f2020] rounded-xl overflow-hidden border border-[#484848]/20 aspect-[3/4] p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <SkeletonBlock className="h-12 w-12 rounded-lg" />
              <SkeletonLine className="h-3 w-32" />
            </div>
            <SkeletonBlock className="h-8 w-24 rounded-full" />
          </div>
          <div className="space-y-4 pt-24">
            <SkeletonLine className="h-10 w-5/6" />
            <SkeletonLine className="h-5 w-48" />
            <div className="space-y-4 pt-6 border-t border-[#484848]/20">
              <div className="flex justify-between gap-4">
                <SkeletonLine className="h-3 w-12" />
                <SkeletonLine className="h-3 w-24" />
              </div>
              <div className="flex justify-between gap-4">
                <SkeletonLine className="h-3 w-16" />
                <SkeletonLine className="h-3 w-28" />
              </div>
            </div>
          </div>
          <SkeletonBlock className="h-2 w-full rounded-none" />
        </div>
      </div>
    </div>
  </div>
);
