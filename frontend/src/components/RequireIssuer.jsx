import React from 'react';
import { useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import ForInstitutions from '../pages/ForInstitutions';

/**
 * Route guard protecting institutional workflows (/dashboard, /issue, /history).
 * Prevents guarded components from mounting without a connected, on-chain authorized
 * issuer wallet (ISSUER_ROLE or DEFAULT_ADMIN_ROLE).
 * Anonymous visitors and unauthorized wallets see the For Institutions gate instead.
 */
const RequireIssuer = ({ children }) => {
  const { account, isIssuer, isAdmin, loading, initialized } = useWeb3();
  const location = useLocation();

  if (!initialized || (account && loading)) {
    return (
      <div className="min-h-screen bg-[#CDCDCD] text-[#292333] font-['Inter'] flex flex-col items-center justify-center px-6">
        <div
          className="rounded-[24px] px-8 py-7 flex flex-col items-center gap-3 text-center max-w-sm w-full"
          style={{
            background: 'rgba(255, 255, 255, 0.48)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.06)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div className="w-8 h-8 border-2 border-[#513582]/30 border-t-[#513582] rounded-full animate-spin" />
          <p className="text-[14px] font-semibold text-[#292333]">Verifying institutional authorization</p>
          <p className="text-[12px] text-[#756F80]">Checking wallet connection and on-chain issuer role…</p>
        </div>
      </div>
    );
  }

  if (!account || (!isIssuer && !isAdmin)) {
    return <ForInstitutions requestedPath={location.pathname} />;
  }

  return children;
};

export default RequireIssuer;
