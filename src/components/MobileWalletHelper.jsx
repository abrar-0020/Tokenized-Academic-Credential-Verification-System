import { useMemo } from 'react';

const MobileWalletHelper = () => {
  const isMobile = useMemo(() => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent), []);

  if (!isMobile) return null;

  return (
    <div className="rounded-lg border border-[#484848]/30 bg-[#131313] p-3 text-xs text-[#c6c6c7]">
      For mobile wallets, open this page in your wallet browser (MetaMask, Trust Wallet, or Rabby).
    </div>
  );
};

export default MobileWalletHelper;
