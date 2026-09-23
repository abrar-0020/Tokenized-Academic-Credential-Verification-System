import ObsidianShell from '../components/ObsidianShell';

const TermsOfService = () => {
  return (
    <ObsidianShell title="Terms of Service" subtitle="USER AGREEMENT">
      <div className="max-w-4xl mx-auto bg-[#131313] rounded-xl p-8 md:p-12 border border-[#1f2020] shadow-2xl shadow-black/40 mb-12 relative z-10">
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-[#acabaa] text-sm mb-8 font-mono">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-[#e7e5e4] font-headline mt-8 mb-4 text-2xl font-bold">1. Acceptance of Terms</h2>
          <p className="text-[#acabaa] leading-relaxed mb-6">
            By accessing or using TokCred / The Scholar Ledger, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
          </p>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">2. Platform Nature and Non-Custodial Services</h2>
          <p className="text-[#acabaa] leading-relaxed mb-6">
            We provide a decentralized infrastructure for the issuance and verification of academic credentials. We do not have custody or control over your digital wallet (e.g., MetaMask). You are solely responsible for maintaining the security of your private keys and seed phrases. If you lose access to your wallet, we cannot recover your credentials.
          </p>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">3. Soulbound Tokens (Non-Transferable)</h2>
          <p className="text-[#acabaa] leading-relaxed mb-4">
            Credentials issued on our platform utilize the ERC-721 standard but are explicitly designed as "Soulbound" tokens. This means:
          </p>
          <ul className="list-disc pl-6 text-[#acabaa] space-y-3 mb-6">
            <li>They cannot be transferred, sold, or traded to another wallet address.</li>
            <li>They hold absolutely no financial, speculative, or monetary value.</li>
            <li>They serve exclusively as cryptographic proof of academic achievement.</li>
          </ul>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">4. Issuance and Revocation</h2>
          <p className="text-[#acabaa] leading-relaxed mb-6">
            The validity and accuracy of any issued credential are the sole responsibility of the issuing academic institution. We do not independently verify the academic records of users. The issuing institution retains the absolute cryptographic right to revoke a credential at any time if they determine that academic fraud, misconduct, or administrative errors have occurred.
          </p>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">5. Limitation of Liability</h2>
          <p className="text-[#acabaa] leading-relaxed mb-6">
            To the maximum extent permitted by law, TokCred / The Scholar Ledger shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform. We are not responsible for network outages, high transaction (gas) fees, blockchain forks, or inaccuracies in the data provided by issuing institutions.
          </p>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">6. Contact</h2>
          <p className="text-[#acabaa] leading-relaxed mb-6">
            For any legal or institutional inquiries regarding these terms, please contact us at <a href="mailto:space.pikkle@gmail.com" className="text-[#8197ff] hover:underline font-medium">space.pikkle@gmail.com</a>.
          </p>
        </div>
      </div>
    </ObsidianShell>
  );
};

export default TermsOfService;
