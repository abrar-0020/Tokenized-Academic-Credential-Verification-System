import React from 'react';

type FeatureItem = {
  title: string;
  description: string;
};

const defaultFeatures: FeatureItem[] = [
  { title: 'Issuer Controls', description: 'Only authorized issuers can mint credentials.' },
  { title: 'Public Verification', description: 'Anyone can verify authenticity in seconds.' },
  { title: 'Revocation Support', description: 'Revoke compromised or invalid credentials safely.' },
];

export function FeatureSteps({ features = defaultFeatures }: { features?: FeatureItem[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {features.map((feature) => (
        <article key={feature.title} className="rounded-lg border border-[#484848]/30 bg-[#131313] p-4">
          <h3 className="text-sm font-semibold text-[#e7e5e4]">{feature.title}</h3>
          <p className="mt-2 text-xs text-[#c6c6c7]">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
