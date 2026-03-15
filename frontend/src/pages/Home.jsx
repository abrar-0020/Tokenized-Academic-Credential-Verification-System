import { useWeb3 } from '../context/Web3Context';
import { FeatureStepsDemo } from '../components/ui/feature-demo';
import HeroSection from '../components/ui/a-modern-hero-section';
import { FeaturesSectionWithBentoGridDemo } from '../components/ui/bento-grid-demo';

const Home = () => {
  const { account, connectWallet } = useWeb3();

  return (
    <div style={{ position: 'relative', overflowX: 'hidden', width: '100%' }}>

      {/*  Hero  */}
      <HeroSection account={account} onConnect={connectWallet} />

      {/*  How It Works  */}
      <FeatureStepsDemo />

      {/*  Why Blockchain  */}
      <FeaturesSectionWithBentoGridDemo />

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
