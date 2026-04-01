import React from 'react';

type HeroSectionProps = {
  title?: string;
  subtitle?: string;
};

export default function HeroSection({
  title = 'Tokenized Academic Credentials',
  subtitle = 'Issue and verify academic records on-chain with confidence.',
}: HeroSectionProps) {
  return (
    <section className="rounded-xl border border-[#484848]/30 bg-[#131313] p-8 text-[#e7e5e4]">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-[#c6c6c7]">{subtitle}</p>
    </section>
  );
}
