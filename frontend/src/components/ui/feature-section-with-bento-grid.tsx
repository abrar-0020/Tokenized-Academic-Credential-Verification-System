import React from 'react';

const cards = [
  { title: 'On-chain Issuance', text: 'Mint tamper-proof credentials with metadata.' },
  { title: 'Fast Lookup', text: 'Verify credentials instantly by token ID.' },
  { title: 'Role Access', text: 'Admin and issuer permissions built in.' },
  { title: 'IPFS Metadata', text: 'Store credential details in decentralized storage.' },
];

export function FeaturesSectionWithBentoGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <article key={card.title} className="rounded-lg border border-[#484848]/30 bg-[#131313] p-5">
          <h3 className="text-sm font-semibold text-[#e7e5e4]">{card.title}</h3>
          <p className="mt-2 text-xs text-[#c6c6c7]">{card.text}</p>
        </article>
      ))}
    </section>
  );
}
