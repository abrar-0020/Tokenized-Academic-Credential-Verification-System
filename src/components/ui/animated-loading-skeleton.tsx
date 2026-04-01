import React from 'react';

export default function AnimatedLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="h-10 w-1/2 animate-pulse rounded bg-[#1f2020]" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-28 animate-pulse rounded-lg bg-[#1a1a1a]" />
        ))}
      </div>
    </div>
  );
}
