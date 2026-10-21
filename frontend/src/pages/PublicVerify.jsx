import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import { ChevronDown, Link2, ExternalLink, Copy, Check, X } from 'lucide-react';
import Alert from '../components/Alert';
import { formatDate } from '../utils/helpers';
import { verifyCredentialPublic, ipfsToHttp } from '../logic';
import { CONTRACT_ADDRESS } from '../config/contract';const PUBLIC_RPC =
  import.meta.env.VITE_PUBLIC_RPC_URL ||
  'https://ethereum-sepolia-rpc.publicnode.com';

const PublicVerify = () => {
  const navigate = useNavigate();
  const { account, connectWallet, disconnectWallet, isAdmin, isIssuer, networkId, loading: web3Loading, error: web3Error } = useWeb3();

  const [tokenId, setTokenId] = useState('');
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  const verifyTokenId = async (id) => {
    if (id === '' || id === null || id === undefined || isNaN(id) || parseInt(id, 10) < 0) {
      setError('Please enter a valid token ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCredential(null);
      setMetadata(null);

      const result = await verifyCredentialPublic(id, PUBLIC_RPC);
      setCredential(result.credential);
      setMetadata(result.metadata);
      setShareUrl(`${window.location.origin}/public-verify?tokenId=${id}`);
    } catch (err) {
      if (err.message?.includes('Credential does not exist') || err.reason?.includes('does not exist')) {
        setError('Credential not found. Please check the token ID.');
      } else {
        setError(err.reason || err.message || 'Failed to verify credential');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('tokenId');
    setShareUrl(window.location.href);
    if (tid) {
      setTokenId(tid);
      void verifyTokenId(tid);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    void verifyTokenId(tokenId);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const resetVerification = () => {
    setCredential(null);
    setMetadata(null);
    setTokenId('');
    setError(null);
    setShareUrl(`${window.location.origin}/public-verify`);
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', '/public-verify');
    }
  };

  // SVG Icons
  const Icons = {
    BrandMark: () => (
      <div className="flex items-center justify-center w-9 h-9 bg-[#513582] rounded-[9px]">
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 3L2 7.5L10.5 12L19 7.5L10.5 3Z" stroke="#FFFEFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12.5L10.5 17L19 12.5" stroke="#FFFEFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    ),
    Fingerprint: () => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.3333 9.16667V10C18.3323 11.728 17.797 13.4116 16.7937 14.8315C15.7904 16.2515 14.3644 17.3424 12.6983 17.9687C11.0323 18.5949 9.19946 18.728 7.42777 18.3496C5.65608 17.9711 4.02273 17.0984 2.73031 15.8447" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 2.5V2.5C8.01088 2.5 6.10322 3.29018 4.6967 4.6967C3.29018 6.10322 2.5 8.01088 2.5 10V11.6667" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.83331 6.66666C5.83331 6.66666 7.49998 5 9.99998 5C12.5 5 14.1666 6.66666 14.1666 6.66666" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 13.3333C5 13.3333 6.66667 11.6667 10 11.6667C13.3333 11.6667 15 13.3333 15 13.3333" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 8.33334V15" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    ArrowRight: () => (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.54163 8.5H13.4583" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 3.54166L13.4583 8.5L8.5 13.4583" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Landmark: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21H21" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 3L2 8H22L12 3Z" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 11V17" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 11V17" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11V17" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 11V17" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Eye: () => (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 6.5C1 6.5 2.83333 2.16666 6.5 2.16666C10.1667 2.16666 12 6.5 12 6.5C12 6.5 10.1667 10.8333 6.5 10.8333C2.83333 10.8333 1 6.5 1 6.5Z" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 8.125C7.39746 8.125 8.125 7.39746 8.125 6.5C8.125 5.60254 7.39746 4.875 6.5 4.875C5.60254 4.875 4.875 5.60254 4.875 6.5C4.875 7.39746 5.60254 8.125 6.5 8.125Z" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    ShieldCheck: () => (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 1.58334L2.375 4.75V8.70834C2.375 12.315 5.43875 15.6592 9.5 17.4167C13.5613 15.6592 16.625 12.315 16.625 8.70834V4.75L9.5 1.58334Z" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.33337 9.5L8.70837 11.875L12.6667 7.125" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    CheckCircle: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.6666 7.38668V8.00001C14.6658 9.43764 14.2003 10.8365 13.3395 11.9879C12.4788 13.1393 11.2688 13.9817 9.8893 14.3893C8.50979 14.7969 7.03472 14.7476 5.68453 14.2501C4.33433 13.7527 3.18128 12.8344 2.40026 11.6318C1.61923 10.4292 1.25301 8.97573 1.35418 7.52554C1.45536 6.07535 2.01878 4.7051 2.96029 3.61794C3.9018 2.53077 5.17112 1.78546 6.57948 1.49525C7.98783 1.20504 9.45995 1.38531 10.7733 2.01334" stroke="#488F61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.6667 2.66666L8.00004 9.34001L6.00004 7.34001" stroke="#488F61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    FileText: () => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.6667 1.66666H5.00004C4.55801 1.66666 4.13409 1.84225 3.82153 2.15481C3.50897 2.46737 3.33337 2.89129 3.33337 3.33332V16.6667C3.33337 17.1087 3.50897 17.5326 3.82153 17.8452C4.13409 18.1577 4.55801 18.3333 5.00004 18.3333H15C15.4421 18.3333 15.866 18.1577 16.1786 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66666L11.6667 1.66666Z" stroke="#7053AD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.6666 1.66666V6.66666H16.6666" stroke="#7053AD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.3333 10.8333H6.66663" stroke="#7053AD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.3333 14.1667H6.66663" stroke="#7053AD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.33337 7.5H6.66671" stroke="#7053AD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Download: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="#F2F2F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.66663 6.66666L7.99996 10L11.3333 6.66666" stroke="#F2F2F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 10V2" stroke="#F2F2F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    LinkIcon: () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.66667 8.66665C6.9806 8.98048 7.40624 9.15678 7.8502 9.15678C8.29416 9.15678 8.71979 8.98048 9.03333 8.66665L11.4 6.29998C11.7141 5.98592 11.8906 5.55994 11.8906 5.11581C11.8906 4.67169 11.7141 4.24571 11.4 3.93165C11.0859 3.61759 10.66 3.44116 10.2158 3.44116C9.77171 3.44116 9.34573 3.61759 9.03167 3.93165L7.84833 5.11498" stroke="#7053AD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.33333 7.33335C9.0194 7.01952 8.59376 6.84322 8.1498 6.84322C7.70584 6.84322 7.28021 7.01952 6.96667 7.33335L4.6 9.70002C4.28591 10.0141 4.10948 10.4401 4.10948 10.8842C4.10948 11.3283 4.28591 11.7543 4.6 12.0684C4.91406 12.3824 5.34004 12.5588 5.78417 12.5588C6.22829 12.5588 6.65427 12.3824 6.96833 12.0684L8.15167 10.885" stroke="#7053AD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Expand: () => (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 3V1H3" stroke="#7053AD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 3V1H9" stroke="#7053AD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 9V11H3" stroke="#7053AD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 9V11H9" stroke="#7053AD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  const CertificatePreview = ({ isResult }) => (
    <div className="relative flex flex-col items-center">
      <div 
        className="relative flex flex-col items-center justify-center w-[706px] h-[552px] rounded-[28px] isolate overflow-hidden"
        style={{
          background: 'rgba(198, 198, 200, 0.22)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.72)',
          boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)'
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-32 -right-20 w-[400px] h-[400px] bg-white/20 rounded-full blur-2xl pointer-events-none" />

      {/* Container for the paper stack */}
      <div className="relative w-[608px] h-[452px] -mt-8">
        
        {/* Layer 1 (Bottom paper, shifted right and rotated right) */}
        <div className="absolute inset-0 bg-[#E8E2D2] shadow-[0px_16px_28px_rgba(68,50,84,0.1)] rounded-[3px] rotate-[4deg] translate-x-[20px] -translate-y-[6px] z-10 pointer-events-none"></div>

        {/* Layer 2 (Middle paper, shifted right and rotated right) */}
        <div className="absolute inset-0 bg-[#F5F0E6] shadow-[0px_16px_28px_rgba(68,50,84,0.1)] rounded-[3px] rotate-[2deg] translate-x-[10px] -translate-y-[3px] z-10 pointer-events-none"></div>

        {/* Layer 3 (Top Credential artifact) */}
        <div className="absolute inset-0 flex flex-col items-center px-7 py-4 bg-[#FFFEFA] border border-[#E8DBC0]/50 shadow-[0px_24px_48px_rgba(68,50,84,0.15)] rounded-[3px] z-20 overflow-hidden">
        
        {/* Issuer identity */}
        <div className="flex items-center gap-2 mb-1">
          <Icons.Landmark />
          <h2 className="font-['Cormorant_Garamond'] font-semibold text-[22px] leading-[26px] text-[#513582]">
            {metadata?.institution || 'Issuing Authority'}
          </h2>
        </div>
        <p className="font-['Inter'] font-normal text-[8.5px] tracking-[1.8px] text-[#756F80] mb-2 uppercase">
          Knowledge • Integrity • Possibility
        </p>

        {/* Engraved rule */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8DBC0] to-transparent mb-2"></div>

        <p className="font-['Inter'] font-normal text-[8.5px] tracking-[2px] text-[#7053AD] uppercase mb-1.5">
          Degree Certificate
        </p>

        {/* Award title */}
        <h1 className="font-['Cormorant_Garamond'] font-medium text-[32px] sm:text-[35px] leading-[1.12] text-[#292333] mb-0.5 text-center max-w-[520px] mx-auto text-balance">
          {metadata?.degree || 'Degree Program'}
        </h1>
        
        <p className="font-['Cormorant_Garamond'] font-normal text-[19px] sm:text-[21px] text-[#5B5565] mb-1 text-center max-w-[500px] mx-auto text-balance">
          in {metadata?.branch || metadata?.fieldOfStudy || 'Specialization / Branch'}
        </p>

        <p className="font-['Cormorant_Garamond'] text-[13.5px] text-[#756F80] mb-0.5 text-center">
          is hereby conferred upon
        </p>

        {/* Graduate name */}
        <h2 className="font-['Cormorant_Garamond'] font-semibold text-[38px] sm:text-[42px] leading-[1] text-[#513582] mb-0.5 text-center max-w-[520px] mx-auto text-balance">
          {metadata?.studentName || 'Candidate Full Name'}
        </h2>

        {/* Award distinction */}
        <p className="font-['Cormorant_Garamond'] text-[17px] sm:text-[19px] text-[#5B5565] mb-2 text-center leading-normal">
          with a Cumulative Grade of{' '}
          <span className="font-['Inter'] font-semibold text-[16px] sm:text-[18px] text-[#292333] ml-0.5 tracking-tight inline-block align-baseline">
            {metadata?.grade || 'Honors'}
          </span>
        </p>

        {/* Academic attestation */}
        <div className="flex justify-between items-end w-full mt-auto mb-1">
          {/* QR Code Verification - Only shown when verified */}
          {isResult && credential?.tokenId !== undefined ? (
            <div className="flex items-center gap-2 w-36">
              <div className="p-1 bg-white border border-[#E8DBC0] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] shrink-0">
                <QRCodeSVG 
                  value={`${window.location.origin}/public-verify?tokenId=${credential.tokenId.toString()}`} 
                  size={44} 
                  level="H"
                  fgColor="#292333"
                  bgColor="#FFFFFF"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-['Inter'] font-semibold text-[7.5px] tracking-[0.4px] text-[#513582] uppercase leading-tight">
                  Scan to Verify
                </span>
                <span className="font-['Inter'] text-[7px] text-[#756F80] leading-tight mt-0.5">
                  Official Credential
                </span>
                <span className="font-['IBM_Plex_Mono'] text-[6.5px] text-[#8C6D34] leading-tight mt-0.5">
                  ID: #{credential.tokenId.toString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-36">
              <div className="w-[52px] h-[52px] rounded-[5px] border border-dashed border-[#E8DBC0] bg-[#F5F0E6]/50 flex flex-col items-center justify-center p-1 shrink-0 text-[#7053AD]">
                <Icons.Eye />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-['Inter'] font-semibold text-[7.5px] tracking-[0.4px] text-[#7053AD] uppercase leading-tight">
                  Verification QR
                </span>
                <span className="font-['Inter'] text-[7px] text-[#756F80] leading-tight mt-0.5">
                  Shown upon verify
                </span>
                <span className="font-['IBM_Plex_Mono'] text-[6.5px] text-[#9C95A5] leading-tight mt-0.5">
                  Awaiting ID
                </span>
              </div>
            </div>
          )}

          {/* University seal */}
          <div className="relative flex items-center justify-center w-[58px] h-[58px] shrink-0">
            {/* Outer embossed edge */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E2C889] via-[#D5B571] to-[#AC8C4A] rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.2)]"></div>
            {/* Inner ring */}
            <div className="absolute inset-[2.5px] border-[1px] border-[#8C6D34]/30 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] bg-gradient-to-br from-[#D8B975] to-[#C09B52]"></div>
            {/* Innermost texture */}
            <div className="absolute inset-[5px] border-[0.5px] border-[#FFE9A6]/40 rounded-full bg-gradient-to-br from-[#E8CF94] to-[#C9A963] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"></div>
            <div className="flex flex-col items-center gap-[1px] z-10 mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
              <div className="scale-[0.5] text-[#513582]"><Icons.Landmark /></div>
              <span className="font-['Cormorant_Garamond'] font-bold text-[8.5px] text-[#513582] tracking-wide">SEAL</span>
            </div>
          </div>

          {/* Registrar */}
          <div className="flex flex-col items-end gap-[2px] w-32">
            <span className="font-['Cormorant_Garamond'] italic text-[21px] text-[#513582] leading-[1]">
              {isResult && credential?.issuer ? `${credential.issuer.slice(0, 6)}...${credential.issuer.slice(-4)}` : 'Authorized Registrar'}
            </span>
            <div className="w-full h-[1px] bg-gradient-to-l from-transparent via-[#E8DBC0] to-transparent"></div>
            <span className="font-['Inter'] text-[7.5px] text-[#756F80] uppercase">
              {isResult && credential ? 'Authorized Signatory' : 'Sample Attestation'}
            </span>
          </div>
        </div>

        {/* Credential provenance */}
        <div className="flex justify-between items-center w-full pt-1.5 border-t border-[#E8DBC0]/40">
          <span className="font-['IBM_Plex_Mono'] text-[8.5px] text-[#9C95A5]">
            {isResult && credential?.tokenId !== undefined ? `TC-RU-2026-${credential.tokenId.toString().padStart(5, '0')}` : 'TC-RU-2026-•••••'}
          </span>
          <span className="font-['Inter'] text-[8.5px] tracking-[0.5px] text-[#7053AD] uppercase font-medium">
            {isResult && credential ? 'Digitally Issued • TokCred' : 'Preview Artifact • Sample'}
          </span>
        </div>
      </div>
    </div>

      {/* Presentation caption (Moved inside glass container) */}
      <div className="absolute bottom-[24px] flex items-center gap-2 px-[18px] py-[10px] bg-white/95 border border-white rounded-full z-30 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="text-[#7053AD]">
          {isResult ? <Icons.CheckCircle /> : <Icons.Eye />}
        </div>
        <span className="font-['Inter'] text-[12px] text-[#292333] font-medium tracking-[0.2px]">
          {isResult ? "Authenticated against the issuer's record" : "Awaiting credential verification · Enter Token ID"}
        </span>
      </div>
    </div>
  </div>
  );

  return (
    <div className="min-h-screen bg-[#CDCDCD] font-['Inter'] flex flex-col selection:bg-[#7053AD]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      
      {/* HEADER */}
      <div className="w-full pt-[24px] flex justify-center px-16 z-[100] mb-8 shrink-0">
        <div className="w-full max-w-[1312px] flex items-center justify-between relative">
          {/* Left: Logo */}
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[56px] -ml-6" onClick={() => navigate('/')}>
            <img 
              src="/tokcred_logo-removebg-preview.png" 
              alt="TokCred" 
              className="h-[90px] lg:h-[120px] max-w-none object-contain relative transition-all duration-300" 
              style={{ filter: 'none' }}
            />
          </div>

          {/* Center: Solid White Pill Nav */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-[56px] px-[36px] rounded-full text-[15px] font-[400] gap-[32px] tracking-[-0.01em] shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-colors duration-300 bg-white text-[#101014]">
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/')}>Home</span>
            {Boolean(account && (isAdmin || isIssuer)) ? (
              <>
                <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/dashboard')}>Dashboard</span>
                <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/issue')}>Issue</span>
                <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/history')}>History</span>
              </>
            ) : Boolean(account) ? (
              <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/student-dashboard')}>Student Dashboard</span>
            ) : null}
            <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#513582]" onClick={() => navigate('/public-verify')}>Public Verify</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-[16px]">
            <div>
              <SettingsDropdown 
                account={account}
                isAdmin={isAdmin}
                isIssuer={isIssuer}
                networkId={networkId}
                connectWallet={connectWallet}
                disconnectWallet={disconnectWallet}
                loading={web3Loading}
                error={web3Error}
                buttonClassName={`w-[56px] h-[56px] rounded-full flex items-center justify-center hover:opacity-80 transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] bg-white text-[#101014]`}
                iconSize={22}
              />
            </div>

            <button 
              onClick={account ? disconnectWallet : connectWallet} 
              title={account ? `Connected: ${account} (Click to disconnect)` : 'Connect Wallet'}
              className="h-[56px] px-[24px] text-[15px] font-[500] rounded-full flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(176,150,250,0.2)] bg-[#2D264B] text-white hover:bg-[#3C315B]"
            >
              {account ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Connected</span>
                </>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center pt-[52px] pb-[48px] px-16 max-w-[1440px] mx-auto w-full gap-10 relative">
        
        {!credential && !error ? (
          /* Search / Entry State */
          <>
            <div className="flex flex-row items-center justify-start gap-16 w-full max-w-[1312px]">
              {/* Credential inquiry */}
              <div className="flex flex-col items-start gap-4 w-[542px] shrink-0">
                {/* Pill */}
                <div className="flex items-center justify-start gap-[7px] px-[15px] py-[12px] bg-white/40 border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,1)] backdrop-blur-md rounded-full w-fit h-[44px] mb-1">
                  <Icons.Expand />
                  <span className="font-['Inter'] font-semibold text-[14px] tracking-normal text-[#7053AD] uppercase whitespace-nowrap">
                    Public credential verification
                  </span>
                </div>

                <h1 className="font-['Cormorant_Garamond'] font-medium text-[72px] leading-[96%] tracking-[-2px] text-[#292333] mb-2">
                  Every<br/>achievement.<br/>Authentically<br/>theirs.
                </h1>
                
                <p className="font-['Inter'] text-[15px] leading-[160%] text-[#5B5565] max-w-[340px]">
                  Confirm an academic credential directly with its issuing institution. No account. No guesswork.
                </p>

                {/* Verification form */}
                <form onSubmit={handleSubmit} className="flex flex-col w-[438px] gap-3 mt-4">
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-['Inter'] font-semibold text-[15px] text-[#292333]">Credential ID</label>
                  <div className="flex items-center gap-3 px-5 py-[2px] h-[56px] bg-white border border-[#E4DFE9] rounded-[12px] focus-within:border-[#7053AD] focus-within:ring-4 focus-within:ring-[#7053AD]/10 transition-all shadow-sm group">
                    <div className="text-[#9C95A5] group-focus-within:text-[#7053AD] transition-colors"><Icons.Fingerprint /></div>
                    <input
                      className="flex-1 bg-transparent border-none outline-none font-['IBM_Plex_Mono'] text-[15px] text-[#292333] placeholder:text-[#9C95A5] h-full w-full"
                      placeholder="e.g. 1 (Token ID)"
                      type="text"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <p className="font-['Inter'] text-[13px] text-[#756F80]">Find this ID on your certificate or issuer's shared link.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-3 w-full h-[54px] bg-gradient-to-r from-[#513582] to-[#110B1C] border border-[#1A1A1A] rounded-[12px] shadow-[0px_12px_24px_rgba(68,50,84,0.18)] hover:shadow-[0px_16px_32px_rgba(68,50,84,0.25)] active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
                >
                  <span className="font-['Inter'] font-semibold text-[17px] text-white">
                    {loading ? 'Verifying...' : 'Verify credential'}
                  </span>
                  {!loading && <Icons.ArrowRight />}
                </button>
              </form>

              <p className="font-['Inter'] text-[13px] text-[#756F80] mt-4 pt-4 border-t border-[#E4DFE9]/50 w-[438px]">
                Free to verify · No personal information required
              </p>
            </div>

            {/* Credential focal point */}
            <div className="relative flex flex-col items-center justify-center flex-1">
              
              {/* Background ambient orbs for glassmorphism diffraction */}
              <div className="absolute top-[5%] right-[10%] w-[450px] h-[450px] bg-white/50 rounded-full blur-[100px] pointer-events-none z-0"></div>
              <div className="absolute bottom-[5%] left-[5%] w-[350px] h-[350px] bg-[#E8DBC0]/40 rounded-full blur-[80px] pointer-events-none z-0"></div>
              
              <div className="z-10">
                <CertificatePreview isResult={false} />
              </div>
              
              <p className="font-['Inter'] text-[13px] text-[#5B5565] text-center w-full mt-6 z-10">
                A digital record. An enduring achievement.
              </p>
            </div>
          </div>

          {/* Verification guidance */}
          <div className="flex flex-row items-center p-[28px] gap-8 w-full max-w-[1312px] bg-white/20 border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-lg">
              <div className="flex gap-3 flex-1">
                <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                  <Icons.Fingerprint />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-[13px] text-[#292333]">One unique ID</h3>
                  <p className="text-[12px] leading-[160%] text-[#756F80]">Use the credential ID supplied by the graduate or institution.</p>
                </div>
              </div>
              <div className="flex gap-3 flex-1">
                <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                  <Icons.Landmark />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-[13px] text-[#292333]">Direct from the issuer</h3>
                  <p className="text-[12px] leading-[160%] text-[#756F80]">We check the official record, not a screenshot or uploaded file.</p>
                </div>
              </div>
              <div className="flex gap-3 flex-1">
                <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                  <Icons.ShieldCheck />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-[13px] text-[#292333]">A clear, trusted result</h3>
                  <p className="text-[12px] leading-[160%] text-[#756F80]">See the award details and verification provenance in one place.</p>
                </div>
              </div>
            </div>
          </>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-start gap-[24px] w-full max-w-[1312px]">
            {/* Result navigation */}
            <button onClick={resetVerification} className="flex items-center gap-[8px] font-['Inter'] text-[20px] text-[#1A1A1A] hover:text-[#7053AD] transition-colors h-[24px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verify another credential
            </button>

            {/* Verification workspace */}
            <div className="flex flex-row items-start gap-[64px] w-full">
              {/* Left Column */}
              <div className="flex flex-col items-start gap-[22px] w-[438px] shrink-0">
                 {/* Status badge */}
                 <div className="flex items-center gap-[7px] px-[12px] py-[7px] bg-[rgba(255,59,48,0.12)] border border-[rgba(255,59,48,0.3)] rounded-full h-[39px]">
                    <div className="w-[15px] h-[15px] rounded-full border-[1.6px] border-[#D92D20] flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D92D20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                    <span className="font-['Inter'] font-semibold text-[15px] leading-[18px] text-[#D92D20]">
                      Credential not found
                    </span>
                 </div>
                 
                 {/* Headline */}
                 <h1 className="font-['Cormorant_Garamond'] font-medium text-[64px] leading-[102%] tracking-[-1.5px] text-[#292333]">
                   No record<br/>found.
                 </h1>
                 <p className="font-['Inter'] text-[15px] leading-[170%] text-[#756F80]">
                   We couldn't find a credential matching the ID provided. Please check for typos and try again.
                 </p>

                 {/* Invalid credential input */}
                 <div className="flex flex-col gap-2 w-full mt-2">
                    <label className="font-['Inter'] font-semibold text-[15px] text-[#292333]">Credential ID</label>
                    <div className="flex items-center gap-3 px-5 py-[2px] h-[56px] bg-white border border-[#D92D20] rounded-[12px] focus-within:ring-4 focus-within:ring-[#D92D20]/10 transition-all shadow-sm group">
                      <div className="text-[#D92D20]"><Icons.Fingerprint /></div>
                      <input
                        className="flex-1 bg-transparent border-none outline-none font-['IBM_Plex_Mono'] text-[15px] text-[#292333] placeholder:text-[#9C95A5] h-full w-full"
                        type="text"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center justify-center gap-3 w-full h-[54px] bg-gradient-to-r from-[#513582] to-[#110B1C] border border-[#1A1A1A] rounded-[12px] shadow-[0px_12px_24px_rgba(68,50,84,0.18)] hover:shadow-[0px_16px_32px_rgba(68,50,84,0.25)] active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
                    >
                      <span className="font-['Inter'] font-semibold text-[17px] text-white">
                        {loading ? 'Verifying...' : 'Verify another ID'}
                      </span>
                      {!loading && <Icons.ArrowRight />}
                    </button>
                 </div>

                 {/* Troubleshooting card */}
                 <div className="flex flex-col items-start p-[24px] gap-[16px] w-[438px] bg-[rgba(255,255,255,0.3)] border border-[#E4DFE9] rounded-[16px] mt-2 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <h3 className="font-['Inter'] font-semibold text-[16px] text-[#292333]">Troubleshooting tips</h3>
                    <ul className="list-disc pl-5 font-['Inter'] text-[14px] leading-[160%] text-[#756F80] flex flex-col gap-2">
                      <li>Ensure you have typed the ID correctly.</li>
                      <li>Check if the credential was issued recently.</li>
                      <li>Contact the issuing institution if the problem persists.</li>
                    </ul>
                 </div>
              </div>

              {/* Right Column: frosted-glass container */}
              <div className="flex flex-col items-end gap-[16px] w-[810px] flex-1">
                <div className="flex flex-col items-center justify-center w-[706px] h-[552px] rounded-[28px] relative overflow-hidden isolate"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
                    backdropFilter: 'blur(40px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 40px 80px -12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.7)'
                  }}
                >
                   {/* Background ambient orbs */}
                   <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-red-500/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
                   
                   {/* Verification inquiry card */}
                   <div className="flex flex-col items-start p-[32px] gap-[24px] w-[440px] bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-10 border border-[#E4DFE9]/50">
                      <div className="flex items-center gap-[12px]">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#F5F1FA] rounded-[10px]">
                          <Icons.Eye />
                        </div>
                        <h3 className="font-['Inter'] font-semibold text-[18px] text-[#292333]">Verification inquiry</h3>
                      </div>
                      <div className="flex flex-col gap-[8px] w-full border-t border-[#E4DFE9] pt-[16px]">
                        <span className="font-['Inter'] text-[14px] text-[#756F80]">Submitted ID</span>
                        <span className="font-['IBM_Plex_Mono'] text-[16px] text-[#292333] break-all">{tokenId}</span>
                      </div>
                      <div className="flex flex-col gap-[8px] w-full border-t border-[#E4DFE9] pt-[16px]">
                        <span className="font-['Inter'] text-[14px] text-[#756F80]">Status</span>
                        <div className="flex items-center gap-2">
                           <div className="w-[12px] h-[12px] rounded-full bg-[#D92D20]"></div>
                           <span className="font-['Inter'] font-medium text-[15px] text-[#D92D20]">{error || 'Credential not found in the issuer’s registry.'}</span>
                        </div>
                      </div>
                      <p className="font-['Inter'] text-[12px] text-[#9C95A5] mt-[8px]">
                        Your search has been logged securely in accordance with our privacy policy.
                      </p>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Full-width bottom feature panel */}
            <div className="flex flex-row items-center p-[28px] gap-8 w-full max-w-[1312px] bg-white/20 border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-lg mt-[32px]">
                <div className="flex gap-3 flex-1">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                    <Icons.Fingerprint />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-[13px] text-[#292333]">One unique ID</h3>
                    <p className="text-[12px] leading-[160%] text-[#756F80]">Use the credential ID supplied by the graduate or institution.</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-1">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                    <Icons.Landmark />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-[13px] text-[#292333]">Direct from the issuer</h3>
                    <p className="text-[12px] leading-[160%] text-[#756F80]">We check the official record, not a screenshot or uploaded file.</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-1">
                  <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                    <Icons.ShieldCheck />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-[13px] text-[#292333]">A clear, trusted result</h3>
                    <p className="text-[12px] leading-[160%] text-[#756F80]">See the award details and verification provenance in one place.</p>
                  </div>
                </div>
            </div>
          </div>
        ) : (
          /* Result State */
          <div className="flex flex-col items-start gap-[24px] w-full max-w-[1312px]">
            {/* Result navigation */}
            <button onClick={resetVerification} className="flex items-center gap-[8px] font-['Inter'] text-[20px] text-[#1A1A1A] hover:text-[#7053AD] transition-colors h-[24px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verify another credential
            </button>

            {/* Verification workspace */}
            <div className="flex flex-row items-start gap-[64px] w-full">
              
              {/* Verified record summary (Left Column) */}
              <div className="flex flex-col items-start gap-[22px] w-[438px] shrink-0">
                
                {/* Status badge */}
                <div className="flex items-center gap-[7px] px-[12px] py-[7px] bg-[rgba(52,199,89,0.41)] rounded-full h-[39px]">
                  <div className="w-[15px] h-[15px] rounded-full border-[1.6px] border-[#326956] flex items-center justify-center">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#326956" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="font-['Inter'] font-semibold text-[15px] leading-[18px] text-[#1F1F1F]">
                    Verified by issuer
                  </span>
                </div>

                {/* Headline */}
                <h1 className="font-['Cormorant_Garamond'] font-medium text-[64px] leading-[102%] tracking-[-1.5px] text-[#292333]">
                  An authentic<br/>achievement.
                </h1>

                {/* Verification explanation */}
                <p className="font-['Inter'] text-[15px] leading-[170%] text-[#756F80]">
                  This credential matches {metadata?.institution || 'the issuing authority'}'s official record. The issuer's digital signature is intact.
                </p>

                {/* Credential details */}
                <div className="flex flex-col items-start p-[28px] gap-[20px] w-[438px] bg-[rgba(255,255,255,0.1)] border border-[#E4DFE9] rounded-[16px]">
                  
                  {/* Section heading */}
                  <div className="flex flex-row items-center gap-[6px] h-[33px]">
                    <h3 className="font-['Cormorant_Garamond'] text-[27px] leading-[33px] text-[#292333]">The issuer's record</h3>
                    <Icons.FileText className="text-[#7053AD]" />
                  </div>

                  {/* Award details */}
                  <div className="flex flex-row items-start gap-[20px] w-full">
                    <div className="flex flex-col gap-[6px] flex-1">
                      <span className="font-['Inter'] text-[14px] leading-[17px] text-[#756F80]">Recipient</span>
                      <span className="font-['Inter'] font-medium text-[16px] leading-[140%] text-[#292333]">{metadata?.studentName || (credential?.student ? `${credential.student.slice(0, 6)}...${credential.student.slice(-4)}` : 'Recipient')}</span>
                    </div>
                    <div className="flex flex-col gap-[6px] flex-1">
                      <span className="font-['Inter'] text-[14px] leading-[17px] text-[#756F80]">Award</span>
                      <span className="font-['Inter'] font-medium text-[16px] leading-[140%] text-[#292333]">{metadata?.degree || 'Academic Credential'}</span>
                    </div>
                  </div>

                  {/* Academic details */}
                  <div className="flex flex-row items-start gap-[20px] w-full">
                    <div className="flex flex-col gap-[6px] flex-1">
                      <span className="font-['Inter'] text-[14px] leading-[17px] text-[#756F80]">Branch / Field</span>
                      <span className="font-['Inter'] font-medium text-[16px] leading-[140%] text-[#292333] pr-[30px]">{metadata?.branch || metadata?.fieldOfStudy || metadata?.field || 'Academic Program'}</span>
                    </div>
                    <div className="flex flex-col gap-[6px] flex-1">
                      <span className="font-['Inter'] text-[11px] leading-[13px] text-[#756F80]">Issued on</span>
                      <span className="font-['Inter'] font-medium text-[16px] leading-[140%] text-[#292333]">{formatDate(credential.issueTimestamp)}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-[1px] bg-[#E4DFE9]"></div>

                  {/* Credential detail */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <span className="font-['Inter'] text-[14px] leading-[17px] text-[#756F80]">Credential ID</span>
                    <span className="font-['IBM_Plex_Mono'] text-[14px] leading-[140%] text-[#292333]">TC-RU-2026-{tokenId.toString().padStart(5, '0')}</span>
                  </div>

                  {/* Issuer provenance */}
                  <div className="flex flex-row items-center gap-[10px] w-full h-[38px]">
                    <div className="w-[20px] h-[20px] text-[#7053AD]">
                      <Icons.Landmark />
                    </div>
                    <div className="flex flex-col gap-[4px]">
                      <span className="font-['Inter'] font-semibold text-[15px] leading-[18px] text-[#292333]">{metadata?.institution || (credential?.issuer ? `Issuer (${credential.issuer.slice(0, 6)}...${credential.issuer.slice(-4)})` : 'Issuing Authority')}</span>
                      <span className="font-['Inter'] text-[13px] leading-[16px] text-[#756F80]">Cryptographically verified on-chain</span>
                    </div>
                  </div>

                </div>

                {/* Blockchain Details Trigger Component */}
                <button
                  id="blockchain-details-trigger"
                  type="button"
                  onClick={() => setShowBlockchainModal(true)}
                  className="w-[438px] flex items-center justify-between p-[18px_24px] bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.22)] border border-[#E4DFE9] rounded-[16px] backdrop-blur-md shadow-sm transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/40 border border-[#E4DFE9] flex items-center justify-center text-[#513582] group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <span className="font-['Inter'] font-semibold text-[16px] text-[#292333] group-hover:text-[#513582] transition-colors">
                      Blockchain details
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/40 border border-[#E4DFE9] text-[12px] font-['Inter'] font-medium text-[#513582] group-hover:bg-[#513582] group-hover:text-white transition-all shrink-0 shadow-sm">
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Authenticated credential (Right Column) */}
              <div className="flex flex-col items-end gap-[16px] w-[810px] flex-1">
                
                {/* Credential presentation */}
                <div className="flex flex-col items-center justify-center w-[706px] h-[552px] bg-[rgba(198,198,200,0.2)] rounded-[28px] relative overflow-hidden">
                  <div className="absolute top-[-140px] left-[350px] w-[450px] h-[450px] bg-[rgba(255,255,255,0.22)] rounded-full blur-[40px] pointer-events-none z-0"></div>
                  <div className="z-10 relative">
                    <CertificatePreview isResult={true} />
                  </div>
                </div>

                {/* Record actions and provenance */}
                <div className="flex flex-col items-start gap-[16px] w-[706px]">
                  
                  {/* Verification provenance */}
                  <div className="flex flex-col items-start p-[16px_20px] gap-[10px] w-full bg-[rgba(233,243,238,0.2)] rounded-[10px]">
                    <div className="flex flex-row items-center gap-[8px] h-[17px]">
                      <div className="w-[16px] h-[16px] rounded-full border-[1.6px] border-[#326956] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#326956" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="font-['Inter'] font-semibold text-[14px] leading-[17px] text-[#326956]">
                        Issuer record matched · signature intact
                      </span>
                    </div>
                    <span className="font-['Inter'] text-[13px] leading-[150%] text-[#326956] h-[20px]">
                      Checked {new Date().toUTCString().replace('GMT', 'UTC')} · Reference VFY-{Math.random().toString(16).substr(2, 6).toUpperCase()}
                    </span>
                  </div>

                  {/* Record actions */}
                  <div className="flex flex-row items-start gap-[12px] w-full">
                    <button className="flex flex-row justify-center items-center px-[20px] gap-[10px] flex-1 h-[50px] bg-gradient-to-r from-[#513582] to-[#110B1C] border border-[#513582] rounded-[10px] hover:opacity-90 transition-opacity">
                      <span className="font-['Inter'] font-semibold text-[16px] leading-[19px] text-white">Download certificate</span>
                      <Icons.Download className="text-white w-[17px] h-[17px]" />
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="flex flex-row justify-center items-center px-[20px] gap-[10px] flex-1 h-[50px] bg-gradient-to-r from-[#FFFFFF] to-[#999999] border border-[#E4DFE9] rounded-[10px] hover:opacity-90 transition-opacity"
                    >
                      <span className="font-['Inter'] font-semibold text-[16px] leading-[19px] text-[#292333]">
                        {copied ? 'Copied to clipboard' : 'Copy verification link'}
                      </span>
                      {copied ? <Icons.CheckCircle className="text-[#7053AD] w-[17px] h-[17px]" /> : <Icons.LinkIcon className="text-[#7053AD] w-[17px] h-[17px]" />}
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Verification scope */}
            <p className="font-['Inter'] text-[14px] leading-[160%] text-[#1D192B] mt-[8px] w-full max-w-[1312px]">
              Verified at the time shown. This result confirms the issuer's record and digital signature; it is not an endorsement of the credential holder.
            </p>

          </div>
        )}

      </main>

      {/* Blockchain Details Popup Modal */}
      {showBlockchainModal && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in"
          onClick={() => setShowBlockchainModal(false)}
        >
          <div 
            className="relative w-full max-w-[540px] rounded-[24px] bg-[rgba(255,255,255,0.38)] border border-[rgba(255,255,255,0.75)] p-6 sm:p-7 shadow-[0_24px_60px_rgba(41,35,51,0.18),inset_0_1px_2px_rgba(255,255,255,0.85)] backdrop-blur-2xl flex flex-col gap-5 text-[#292333]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E4DFE9]/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/50 border border-[#E4DFE9] flex items-center justify-center text-[#513582] shadow-sm">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-[26px] font-semibold leading-tight text-[#292333]">
                    Blockchain Details
                  </h3>
                  <p className="font-['Inter'] text-[12px] text-[#756F80]">
                    On-chain credential verification on Ethereum Sepolia
                  </p>
                </div>
              </div>
              <button
                id="close-blockchain-modal"
                type="button"
                onClick={() => setShowBlockchainModal(false)}
                className="w-8 h-8 rounded-full bg-white/60 hover:bg-white text-[#756F80] hover:text-[#292333] border border-[#E4DFE9] shadow-sm flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Fields */}
            <div className="flex flex-col gap-3.5">
              
              {/* 1. Token ID */}
              <div className="flex flex-col gap-1.5 p-3.5 bg-[rgba(255,255,255,0.35)] border border-[rgba(255,255,255,0.65)] backdrop-blur-md rounded-[14px] shadow-sm">
                <span className="font-['Inter'] text-[12px] font-medium text-[#756F80]">
                  Token ID
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-['IBM_Plex_Mono'] text-[16px] font-semibold text-[#513582]">
                    #{tokenId || credential?.tokenId?.toString() || '0'}
                  </span>
                  <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#7053AD] bg-[#7053AD]/10 px-2.5 py-0.5 rounded-full font-medium">
                    ERC-721 Soulbound
                  </span>
                </div>
              </div>

              {/* 2. Student Address */}
              <div className="flex flex-col gap-1.5 p-3.5 bg-[rgba(255,255,255,0.35)] border border-[rgba(255,255,255,0.65)] backdrop-blur-md rounded-[14px] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-['Inter'] text-[12px] font-medium text-[#756F80]">
                    Student Address
                  </span>
                  {credential?.student && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(credential.student, 'student')}
                      className="text-[11px] font-['Inter'] font-medium text-[#7053AD] hover:text-[#513582] flex items-center gap-1 cursor-pointer transition-colors bg-white/40 hover:bg-white/70 border border-[#E4DFE9]/60 px-2 py-0.5 rounded-md shadow-xs"
                    >
                      {copiedField === 'student' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'student' ? 'Copied' : 'Copy Address'}</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-['IBM_Plex_Mono'] text-[13px] text-[#292333] break-all select-all">
                    {credential?.student || 'Not specified'}
                  </span>
                  {credential?.student && (
                    <a
                      href={`https://sepolia.etherscan.io/address/${credential.student}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-[#7053AD] hover:text-[#513582] transition-colors shrink-0"
                      title="View Student on Sepolia Etherscan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* 3. Metadata URL */}
              <div className="flex flex-col gap-1.5 p-3.5 bg-[rgba(255,255,255,0.35)] border border-[rgba(255,255,255,0.65)] backdrop-blur-md rounded-[14px] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-['Inter'] text-[12px] font-medium text-[#756F80]">
                    Metadata URL
                  </span>
                  {credential?.metadataURI && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(credential.metadataURI, 'metadata')}
                      className="text-[11px] font-['Inter'] font-medium text-[#7053AD] hover:text-[#513582] flex items-center gap-1 cursor-pointer transition-colors bg-white/40 hover:bg-white/70 border border-[#E4DFE9]/60 px-2 py-0.5 rounded-md shadow-xs"
                    >
                      {copiedField === 'metadata' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'metadata' ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={credential?.metadataURI ? ipfsToHttp(credential.metadataURI) : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-['IBM_Plex_Mono'] text-[12px] text-[#513582] hover:underline break-all truncate flex-1"
                    title={credential?.metadataURI}
                  >
                    {credential?.metadataURI || 'N/A'}
                  </a>
                  {credential?.metadataURI && (
                    <a
                      href={ipfsToHttp(credential.metadataURI)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-[#7053AD] hover:text-[#513582] transition-colors shrink-0"
                      title="Open IPFS Metadata"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* 4. Sepolia Etherscan Link */}
              <div className="flex flex-col gap-2.5 p-3.5 bg-[rgba(255,255,255,0.35)] border border-[rgba(255,255,255,0.65)] backdrop-blur-md rounded-[14px] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-['Inter'] text-[12px] font-medium text-[#756F80]">
                    Sepolia Etherscan Links
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-['Inter'] font-medium text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Verified on Sepolia
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* View Token on Sepolia Etherscan */}
                  <a
                    href={`https://sepolia.etherscan.io/nft/${CONTRACT_ADDRESS}/${tokenId || credential?.tokenId?.toString() || '0'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-[42px] px-3 bg-[#513582] hover:bg-[#41276b] text-white rounded-[10px] text-[13px] font-['Inter'] font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Token on Etherscan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* View Contract on Sepolia Etherscan */}
                  <a
                    href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-[42px] px-3 bg-white/60 hover:bg-white/90 text-[#292333] border border-[#E4DFE9] rounded-[10px] text-[13px] font-['Inter'] font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Smart Contract</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* Footer note */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E4DFE9]/80 text-[11px] font-['Inter'] text-[#756F80]">
              <span>Network: Ethereum Sepolia (11155111)</span>
              <span className="font-['IBM_Plex_Mono'] text-[10px]">{CONTRACT_ADDRESS ? `${CONTRACT_ADDRESS.slice(0, 8)}...${CONTRACT_ADDRESS.slice(-6)}` : 'On-Chain'}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PublicVerify;

