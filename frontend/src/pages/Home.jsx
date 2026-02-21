import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { account, connectWallet } = useWeb3();

  return (
    <div style={{ position: 'relative', overflowX: 'hidden', width: '100%' }}>

      {/*  Hero  */}
      <section
        style={{ overflowX: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0c4a6e 100%)' }}
        className="text-white"
      >
        <div className="px-5 sm:px-8 py-16 sm:py-20 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-sky-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span>
            Powered by Blockchain Technology
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">
            Tokenized Academic
            <span className="block text-sky-400">Credentials</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
            Secure, verifiable, and permanent academic credentials on the blockchain. No forgeries. No middlemen.
          </p>
          {!account ? (
            <button
              onClick={connectWallet}
              className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-sky-500/30 transition-all text-sm"
            >
              Connect Wallet
            </button>
          ) : (
            <a
              href="/dashboard"
              className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-sky-500/30 transition-all text-sm"
            >
              Go to Dashboard →
            </a>
          )}
        </div>
      </section>

      {/*  How It Works  */}
      <section style={{ overflowX: 'hidden' }} className="bg-white py-12 sm:py-16">
        <div className="px-5 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 text-sm mt-2">Three simple steps to lifelong credential security</p>
          </div>
          <div className="flex flex-col gap-4 max-w-sm mx-auto sm:max-w-none sm:flex-row sm:gap-5 md:max-w-4xl">
            {[
              { icon: '🏛️', step: '01', title: 'Institution Issues', desc: 'Authorized institutions issue non-transferable digital credentials as Soulbound NFTs to students.', color: 'bg-sky-50', accent: 'text-sky-600' },
              { icon: '👤', step: '02', title: 'Student Owns', desc: 'Students permanently own their credentials. Credentials cannot be transferred, ensuring authenticity.', color: 'bg-emerald-50', accent: 'text-emerald-600' },
              { icon: '✅', step: '03', title: 'Anyone Verifies', desc: 'Employers and third parties can instantly verify credentials on-chain without intermediaries.', color: 'bg-amber-50', accent: 'text-amber-600' },
            ].map((item) => (
              <div key={item.step} className="flex-1 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className={`text-xs font-bold ${item.accent} mb-1`}>STEP {item.step}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  Why Blockchain  */}
      <section style={{ overflowX: 'hidden' }} className="bg-slate-50 py-12 sm:py-16">
        <div className="px-5 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Why Blockchain?</h2>
            <p className="text-slate-500 text-sm mt-2">Built for trust, designed for the future</p>
          </div>
          <div className="flex flex-col gap-3 max-w-sm mx-auto sm:max-w-2xl sm:grid sm:grid-cols-2 sm:gap-4 md:max-w-3xl">
            {[
              { icon: '🔒', title: 'Immutable and Secure', desc: 'Once issued, credentials cannot be altered or forged. Blockchain ensures permanent records.', tag: 'Security' },
              { icon: '⚡', title: 'Instant Verification', desc: 'Verify credentials in seconds. No waiting, no paperwork, no middlemen.', tag: 'Speed' },
              { icon: '🌍', title: 'Global Accessibility', desc: 'Access your credentials from anywhere in the world. Truly portable and borderless.', tag: 'Access' },
              { icon: '🔗', title: 'Soulbound Tokens', desc: 'Non-transferable credentials tied to your identity. Cannot be sold or transferred.', tag: 'Identity' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex gap-4 items-start" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)', minWidth: 0 }}>
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  CTA  */}
      {!account && (
        <section
          style={{ overflowX: 'hidden', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
          className="text-white py-12 sm:py-16 text-center"
        >
          <div className="px-5 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Ready to Get Started?</h2>
            <p className="text-sky-200 text-sm mb-7">
              Connect your wallet and explore the future of academic credentials
            </p>
            <button
              onClick={connectWallet}
              className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-sky-50 transition-all text-sm"
            >
              Connect Wallet
            </button>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
