import ObsidianShell from '../components/ObsidianShell';

const PrivacyPolicy = () => {
  return (
    <ObsidianShell title="Privacy Policy" subtitle="LEGAL & COMPLIANCE">
      <div className="max-w-4xl mx-auto bg-[#131313] rounded-xl p-8 md:p-12 border border-[#1f2020] shadow-2xl shadow-black/40 mb-12 relative z-10">
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-[#acabaa] text-sm mb-8 font-mono">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-[#e7e5e4] font-headline mt-8 mb-4 text-2xl font-bold">1. Introduction</h2>
          <p className="text-[#acabaa] leading-relaxed mb-6">
            Welcome to TokCred / The Scholar Ledger ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you understand exactly how your information is handled within a decentralized, blockchain-based environment. This Privacy Policy explains our data collection, storage, and handling practices.
          </p>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">2. Blockchain Immutability & Public Data</h2>
          <p className="text-[#acabaa] leading-relaxed mb-4">
            Our platform operates on the Ethereum blockchain and utilizes the InterPlanetary File System (IPFS) for decentralized storage. By using our services to receive or verify an academic credential, you acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 text-[#acabaa] space-y-3 mb-6">
            <li><strong className="text-[#e7e5e4]">Public Ledger:</strong> Cryptographic wallet addresses, transaction hashes, and token IDs are permanently recorded on a public blockchain and cannot be deleted or altered.</li>
            <li><strong className="text-[#e7e5e4]">Decentralized Storage (IPFS):</strong> Credential metadata (such as your name, institution, degree, and issue date) is stored on IPFS. While we do not store highly sensitive personal identifiers (like Social Security Numbers), the metadata published is globally accessible and immutable.</li>
            <li><strong className="text-[#e7e5e4]">No Right to Erasure:</strong> Due to the immutable nature of blockchain technology, traditional data deletion requests (such as the "Right to be Forgotten" under GDPR) cannot be fulfilled for on-chain data.</li>
          </ul>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">3. Information We Collect</h2>
          <p className="text-[#acabaa] leading-relaxed mb-4">
            We collect the following types of information:
          </p>
          <ul className="list-disc pl-6 text-[#acabaa] space-y-3 mb-6">
            <li><strong className="text-[#e7e5e4]">Wallet Addresses:</strong> Your public Ethereum wallet address when you connect to our platform.</li>
            <li><strong className="text-[#e7e5e4]">Academic Metadata:</strong> Information provided by the issuing institution to generate your credential (Name, Degree, Institution, Graduation Date).</li>
            <li><strong className="text-[#e7e5e4]">Usage Data:</strong> Standard web analytics (such as IP addresses, browser types, and interaction metrics) to maintain and improve our frontend interface.</li>
          </ul>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">4. How We Use Your Information</h2>
          <p className="text-[#acabaa] leading-relaxed mb-6">
            Your information is used strictly to facilitate the issuance and verification of Soulbound academic credentials. We do not sell your personal data to third parties. On-chain data is used purely for cryptographic verification of authenticity.
          </p>

          <h2 className="text-[#e7e5e4] font-headline mt-10 mb-4 text-2xl font-bold">5. Contact Us</h2>
          <p className="text-[#acabaa] leading-relaxed mb-6">
            If you have questions regarding this Privacy Policy or how your data is handled within our decentralized infrastructure, please contact us at <a href="mailto:space.pikkle@gmail.com" className="text-[#8197ff] hover:underline font-medium">space.pikkle@gmail.com</a>.
          </p>
        </div>
      </div>
    </ObsidianShell>
  );
};

export default PrivacyPolicy;
