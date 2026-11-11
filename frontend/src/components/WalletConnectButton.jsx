import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, AlertCircle, X } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

const METAMASK_DOWNLOAD_URL = 'https://metamask.io/download/';

/**
 * Shared wallet connect control across navbars and CTAs.
 * Never fails silently when MetaMask is absent: switches the button itself
 * into an actionable "MetaMask not found — install MetaMask" link and states
 * clearly that public verification requires no wallet while issuing does.
 */
const WalletConnectButton = ({
  className = '',
  missingClassName = '',
  disconnectedLabel = 'Connect Wallet',
  connectedLabel = 'Connected',
  showStatusDot = true,
  inlineNotice = false,
  popoverAlign = 'right',
  fullWidth = false,
  onAfterConnect = null,
}) => {
  const {
    account,
    loading,
    error,
    metaMaskMissing,
    clearWalletError,
    connectWallet,
    disconnectWallet,
  } = useWeb3();
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  useEffect(() => {
    if (metaMaskMissing || error) {
      setNoticeDismissed(false);
    }
  }, [metaMaskMissing, error]);

  const handleClick = async () => {
    if (account) {
      disconnectWallet();
      return;
    }
    setNoticeDismissed(false);
    await connectWallet(false);
    if (onAfterConnect) {
      onAfterConnect();
    }
  };

  if (account) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 transition-all duration-150 ${className}`}
        title={`Connected: ${account} (click to disconnect)`}
      >
        {showStatusDot && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-none" />
        )}
        <span>{connectedLabel}</span>
      </button>
    );
  }

  const showNotice = !noticeDismissed && (metaMaskMissing || Boolean(error));

  const missingButtonClasses =
    missingClassName ||
    'inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 min-h-[42px] py-2 rounded-full text-[11.5px] sm:text-[13px] font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5] hover:bg-[#FEE2E2] transition-colors whitespace-nowrap max-w-full';

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'inline-flex flex-col items-stretch sm:items-end'}`}>
      {metaMaskMissing ? (
        <a
          href={METAMASK_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={missingButtonClasses}
          aria-label="MetaMask not found — install MetaMask"
        >
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-none text-[#DC2626]" />
          <span className="truncate">MetaMask not found — install MetaMask</span>
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-none" />
        </a>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={`flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 ${className}`}
        >
          {showStatusDot && (
            <span className="w-2 h-2 rounded-full bg-[#C4BDD8] flex-none" />
          )}
          <span>{loading ? 'Connecting…' : disconnectedLabel}</span>
        </button>
      )}

      {showNotice && (
        <div
          role="alert"
          className={
            inlineNotice
              ? 'mt-3 w-full max-w-[440px] rounded-[14px] bg-white border border-[#E5DDFB] shadow-md p-3.5 text-left text-[#1A1228]'
              : `fixed top-[84px] right-4 sm:mt-2 ${
                  popoverAlign === 'left' ? 'sm:left-0 sm:right-auto' : 'sm:right-0 sm:left-auto'
                } sm:top-full sm:absolute z-[120] w-[min(340px,calc(100vw-32px))] rounded-[14px] bg-white border border-[#E5DDFB] shadow-xl p-4 text-left text-[#1A1228]`
          }
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-[12.5px] leading-[1.55]">
              {metaMaskMissing ? (
                <>
                  <p className="font-bold text-[#991B1B] mb-1">
                    MetaMask browser extension not detected
                  </p>
                  <p className="text-[#4B445C]">
                    <span className="font-semibold text-[#1A1228]">Public verification needs no wallet</span>, while issuing credentials or unlocking encrypted records requires MetaMask.
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    <a
                      href={METAMASK_DOWNLOAD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-bold text-[#5B21B6] hover:underline"
                    >
                      Install MetaMask <ExternalLink className="w-3 h-3" />
                    </a>
                    <Link
                      to="/public-verify"
                      className="text-[12px] font-semibold text-[#6B6480] hover:text-[#1A1228] hover:underline"
                    >
                      Verify without wallet →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-bold text-[#991B1B] mb-1">Wallet connection notice</p>
                  <p className="text-[#4B445C]">{error}</p>
                  <p className="text-[#6B6480] text-[12px] mt-1.5">
                    Public verification needs no wallet — issuing credentials requires MetaMask.
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setNoticeDismissed(true);
                clearWalletError();
              }}
              aria-label="Dismiss wallet notice"
              className="p-1 rounded-full text-[#9B93B4] hover:text-[#1A1228] hover:bg-[#F5F2FF] transition-colors flex-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
