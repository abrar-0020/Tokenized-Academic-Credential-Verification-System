import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import {
  Link2,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Wallet,
  Unlock,
  KeyRound
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import {
  verifyCredentialPublic,
  ipfsToHttp,
  decryptCredentialPayload
} from '../logic';
import { CONTRACT_ADDRESS } from '../config/contract';
import { downloadCertificatePdf } from '../services/certificateGenerator';

const PUBLIC_RPC =
  import.meta.env.VITE_PUBLIC_RPC_URL ||
  'https://ethereum-sepolia-rpc.publicnode.com';

const PublicVerify = () => {
  const navigate = useNavigate();
  const {
    account,
    signer,
    connectWallet,
    disconnectWallet,
    isAdmin,
    isIssuer,
    networkId,
    loading: web3Loading,
    error: web3Error
  } = useWeb3();

  const [tokenId, setTokenId] = useState('');
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [errorTitle, setErrorTitle] = useState('Credential not found');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRevoked = Boolean(credential?.revoked);
  const isEncryptedRecord = Boolean(metadata?.isEncrypted && metadata?.encryptedData?.ciphertext);
  const isLockedEncrypted = Boolean(credential && isEncryptedRecord && !decryptedData);
  const isMetadataUnavailable = Boolean(metadata?.unavailable);
  const effectiveMeta = isEncryptedRecord ? decryptedData : (isMetadataUnavailable ? null : metadata);

  const resolvedHolderWallet =
    effectiveMeta?.holderWallet ||
    credential?.holderWallet ||
    credential?.student ||
    null;

  const shortHolderWallet = resolvedHolderWallet
    ? `${resolvedHolderWallet.slice(0, 6)}...${resolvedHolderWallet.slice(-4)}`
    : 'Not bound';

  const resolvedCredentialId =
    effectiveMeta?.credentialId ||
    metadata?.credentialId ||
    metadata?.id ||
    (credential?.tokenId !== undefined ? `TC-TOKEN-${credential.tokenId.toString()}` : 'N/A');

  const resolvedEnrollmentNumber =
    effectiveMeta?.enrollmentNumber ||
    effectiveMeta?.registrationNumber ||
    null;

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
    const trimmed = String(id ?? '').trim();

    if (trimmed === '') {
      setValidationError('Please enter a token ID');
      return;
    }

    if (!/^\d+$/.test(trimmed)) {
      setValidationError('Please enter a valid non-negative numeric token ID');
      return;
    }

    try {
      setLoading(true);
      setValidationError(null);
      setLookupError(null);
      setCredential(null);
      setMetadata(null);
      setDecryptedData(null);
      setDecryptionError(null);

      const result = await verifyCredentialPublic(trimmed, PUBLIC_RPC);
      setCredential(result.credential);
      setMetadata(result.metadata);
      setShareUrl(`${window.location.origin}/public-verify?tokenId=${trimmed}`);
    } catch (err) {
      const msg = err?.reason || err?.message || 'Failed to verify credential';
      if (msg.includes('Credential does not exist') || msg.includes('ERC721NonexistentToken')) {
        setErrorTitle('Credential not found');
        setLookupError('No credential matching that token ID exists in the on-chain registry.');
      } else {
        setErrorTitle('Verification lookup failed');
        setLookupError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockEncrypted = async () => {
    if (!isEncryptedRecord || !metadata?.encryptedData) return;

    if (!account || !signer) {
      await connectWallet(false);
      return;
    }

    try {
      setDecrypting(true);
      setDecryptionError(null);
      const { decryptedData: unlocked } = await decryptCredentialPayload({
        encryptedPayload: metadata.encryptedData,
        credentialId: metadata.credentialId || `TC-TOKEN-${credential?.tokenId?.toString()}`,
        tokenId: credential?.tokenId?.toString(),
        studentAddress: credential?.student || metadata?.holder,
        account,
        signer,
        rpcUrl: PUBLIC_RPC,
      });
      setDecryptedData(unlocked);
    } catch (err) {
      setDecryptionError(
        err?.message ||
        'Decryption denied. Only the Soulbound holder wallet or an authorized issuing authority can decrypt.'
      );
    } finally {
      setDecrypting(false);
    }
  };

  const [searchParams] = useSearchParams();
  const tidParam = searchParams.get('tokenId');

  useEffect(() => {
    const tid = tidParam ?? new URLSearchParams(window.location.search).get('tokenId');
    setShareUrl(window.location.href);
    if (tid !== null && String(tid).trim() !== '') {
      setTokenId(String(tid));
      void verifyTokenId(tid);
    }
  }, [tidParam]);

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

  const handleDownloadCertificate = async () => {
    if (!credential || isRevoked || isLockedEncrypted || isMetadataUnavailable) return;
    try {
      setDownloading(true);
      await downloadCertificatePdf(credential, effectiveMeta);
    } catch (err) {
      console.error('Failed to generate certificate PDF:', err);
      alert(err?.message || 'Failed to generate certificate PDF. Please check your browser permissions.');
    } finally {
      setDownloading(false);
    }
  };

  const resetVerification = () => {
    setCredential(null);
    setMetadata(null);
    setDecryptedData(null);
    setDecryptionError(null);
    setTokenId('');
    setValidationError(null);
    setLookupError(null);
    setShareUrl(`${window.location.origin}/public-verify`);
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', '/public-verify');
    }
  };

  const verificationRef = credential?.tokenId !== undefined
    ? `VFY-${String(credential.tokenId).padStart(4, '0')}-${metadata?.credentialId || String(credential.issueTimestamp || '0').slice(-6)}`
    : 'VFY-ONCHAIN';

  // SVG Icons
  const Icons = {
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
    <div className="relative flex flex-col items-center w-full max-w-[706px]">
      <div 
        className="relative flex flex-col items-center justify-center w-full h-[360px] sm:h-[450px] md:h-[520px] lg:h-[552px] rounded-[20px] sm:rounded-[28px] isolate overflow-hidden"
        style={{
          background: 'rgba(198, 198, 200, 0.22)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.72)',
          boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)'
        }}
      >
        <div className="absolute -top-32 -right-20 w-[400px] h-[400px] bg-white/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-full flex items-center justify-center -mt-6 sm:-mt-8">
          <div className="transform scale-[0.46] xs:scale-[0.54] sm:scale-[0.72] md:scale-[0.88] lg:scale-100 origin-center transition-transform duration-200">
            <div className="relative w-[608px] h-[452px]">
              {/* Bottom paper layers */}
              <div className="absolute inset-0 bg-[#E8E2D2] shadow-[0px_16px_28px_rgba(68,50,84,0.1)] rounded-[3px] rotate-[4deg] translate-x-[20px] -translate-y-[6px] z-10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-[#F5F0E6] shadow-[0px_16px_28px_rgba(68,50,84,0.1)] rounded-[3px] rotate-[2deg] translate-x-[10px] -translate-y-[3px] z-10 pointer-events-none"></div>

              {/* Top credential artifact */}
              <div className="absolute inset-0 flex flex-col items-center px-7 py-4 bg-[#FFFEFA] border border-[#E8DBC0]/50 shadow-[0px_24px_48px_rgba(68,50,84,0.15)] rounded-[3px] z-20 overflow-hidden">
                {/* Issuer header */}
                <div className="flex items-center gap-2 mb-1">
                  <Icons.Landmark />
                  <h2 className="font-['Cormorant_Garamond'] font-semibold text-[22px] leading-[26px] text-[#513582]">
                    {isResult
                      ? (isLockedEncrypted ? 'Confidential Issuing Institution' : (effectiveMeta?.institution || 'Verified Authority'))
                      : 'Accredited Institution'}
                  </h2>
                </div>
                <p className="font-['Inter'] font-normal text-[8.5px] tracking-[1.8px] text-[#756F80] mb-2 uppercase">
                  Knowledge • Integrity • Possibility
                </p>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8DBC0] to-transparent mb-2"></div>

                <p className="font-['Inter'] font-normal text-[8.5px] tracking-[2px] text-[#7053AD] uppercase mb-1.5">
                  Degree Certificate
                </p>

                {isResult && isLockedEncrypted ? (
                  <div className="flex flex-col items-center justify-center my-auto px-6 py-5 rounded-2xl bg-[#F6F2FB] border border-[#D8CEEA] text-center max-w-[460px] gap-2.5">
                    <div className="w-11 h-11 rounded-full bg-[#513582] text-white flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="font-['Cormorant_Garamond'] text-[26px] font-semibold text-[#292333] leading-tight">
                      Confidential Record Protected
                    </h3>
                    <p className="font-['Inter'] text-[11px] leading-[1.55] text-[#5B5565]">
                      Student name, enrollment number, degree, grade, field, and institution are AES-256-GCM encrypted on IPFS. On-chain Soulbound ownership is verified for wallet <span className="font-['IBM_Plex_Mono'] font-semibold text-[#513582]">{shortHolderWallet}</span>.
                    </p>
                  </div>
                ) : (
                  <>
                    <h1 className="font-['Cormorant_Garamond'] font-medium text-[30px] sm:text-[33px] leading-[1.1] text-[#292333] mb-0.5 text-center max-w-[520px] mx-auto text-balance">
                      {effectiveMeta?.degree || 'Degree Program'}
                    </h1>
                    <p className="font-['Cormorant_Garamond'] font-normal text-[18px] sm:text-[20px] text-[#5B5565] mb-1 text-center max-w-[500px] mx-auto text-balance">
                      in {effectiveMeta?.branch || effectiveMeta?.fieldOfStudy || 'Specialization / Branch'}
                    </p>
                    <p className="font-['Cormorant_Garamond'] text-[13px] text-[#756F80] mb-0.5 text-center">
                      is hereby conferred upon
                    </p>
                    <h2 className="font-['Cormorant_Garamond'] font-semibold text-[34px] sm:text-[38px] leading-[1.05] text-[#513582] mb-1.5 text-center max-w-[520px] mx-auto text-balance">
                      {effectiveMeta?.studentName || (isResult ? shortHolderWallet : 'Candidate Full Name')}
                    </h2>

                    {/* Wallet & Enrollment Identity Binding */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-2 rounded-full bg-[#F5F0E6]/85 border border-[#E8DBC0] font-['IBM_Plex_Mono'] text-[8.5px] text-[#292333]">
                      <span>Reg. No: <strong>{resolvedEnrollmentNumber || (isResult ? 'Legacy Record' : 'ENR-2026-••••')}</strong></span>
                      <span>·</span>
                      <span>Holder Wallet: <strong>{isResult ? shortHolderWallet : '0x••••...••••'}</strong></span>
                    </div>

                    <p className="font-['Cormorant_Garamond'] text-[16px] sm:text-[18px] text-[#5B5565] mb-2 text-center leading-normal">
                      with a Cumulative Grade of{' '}
                      <span className="font-['Inter'] font-semibold text-[15px] sm:text-[17px] text-[#292333] ml-0.5 tracking-tight inline-block align-baseline">
                        {effectiveMeta?.grade || 'Honors'}
                      </span>
                    </p>
                  </>
                )}

                {/* Academic attestation footer */}
                <div className="flex justify-between items-end w-full mt-auto mb-1">
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
                          Soulbound Token
                        </span>
                        <span className="font-['IBM_Plex_Mono'] text-[6.5px] text-[#8C6D34] leading-tight mt-0.5">
                          Token #{credential.tokenId.toString()}
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
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E2C889] via-[#D5B571] to-[#AC8C4A] rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.2)]"></div>
                    <div className="absolute inset-[2.5px] border-[1px] border-[#8C6D34]/30 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] bg-gradient-to-br from-[#D8B975] to-[#C09B52]"></div>
                    <div className="absolute inset-[5px] border-[0.5px] border-[#FFE9A6]/40 rounded-full bg-gradient-to-br from-[#E8CF94] to-[#C9A963] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"></div>
                    <div className="flex flex-col items-center gap-[1px] z-10 mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                      <div className="scale-[0.5] text-[#513582]"><Icons.Landmark /></div>
                      <span className="font-['Cormorant_Garamond'] font-bold text-[8.5px] text-[#513582] tracking-wide">SEAL</span>
                    </div>
                  </div>

                  {/* Holder / Signatory */}
                  <div className="flex flex-col items-end gap-[2px] w-36">
                    <span className="font-['IBM_Plex_Mono'] text-[10px] font-medium text-[#513582] leading-[1.2]">
                      {isResult ? shortHolderWallet : 'Authorized Signatory'}
                    </span>
                    <div className="w-full h-[1px] bg-gradient-to-l from-transparent via-[#E8DBC0] to-transparent"></div>
                    <span className="font-['Inter'] text-[7.5px] text-[#756F80] uppercase">
                      {isResult ? 'Bound Soulbound Holder' : 'Sample Attestation'}
                    </span>
                  </div>
                </div>

                {/* Credential provenance */}
                <div className="flex justify-between items-center w-full pt-1.5 border-t border-[#E8DBC0]/40">
                  <span className="font-['IBM_Plex_Mono'] text-[8.5px] text-[#9C95A5]">
                    {isResult ? resolvedCredentialId : 'TC-2026-••••••••'}
                  </span>
                  <span className={`font-['Inter'] text-[8.5px] tracking-[0.5px] uppercase font-semibold ${isResult && isRevoked ? 'text-[#D92D20]' : 'text-[#7053AD]'}`}>
                    {isResult && credential ? (isRevoked ? 'Status: Officially Revoked' : (isEncryptedRecord ? 'Encrypted • Soulbound' : 'Digitally Issued • TokCred')) : 'Preview Artifact • Sample'}
                  </span>
                </div>

                {isResult && isRevoked && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                    <div className="transform -rotate-12 border-[3.5px] border-[#D92D20]/85 bg-[#D92D20]/15 px-8 py-2.5 rounded-[10px] backdrop-blur-[0.5px] shadow-[0_12px_28px_rgba(217,45,32,0.22)]">
                      <span className="font-['Inter'] font-black text-[32px] sm:text-[38px] tracking-[8px] text-[#D92D20] uppercase select-none opacity-95">
                        REVOKED
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Presentation caption */}
        <div className={`absolute bottom-[14px] sm:bottom-[24px] flex items-center gap-2 px-3 sm:px-[18px] py-1.5 sm:py-[10px] ${isResult && isRevoked ? 'bg-[#FFF5F5] border border-red-200 text-[#D92D20]' : 'bg-white/95 border border-white text-[#292333]'} rounded-full z-30 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md max-w-[90%]`}>
          <div className={`shrink-0 ${isResult && isRevoked ? 'text-[#D92D20]' : 'text-[#7053AD]'}`}>
            {isResult ? (isRevoked ? <AlertTriangle className="w-4 h-4 text-[#D92D20]" /> : <Icons.CheckCircle />) : <Icons.Eye />}
          </div>
          <span className={`font-['Inter'] text-[10px] sm:text-[12px] font-medium tracking-[0.2px] truncate ${isResult && isRevoked ? 'text-[#D92D20] font-semibold' : 'text-[#292333]'}`}>
            {isResult 
              ? (isRevoked ? "Official record revoked on-chain by issuing authority" : `Soulbound owner ${shortHolderWallet} verified on-chain`) 
              : "Awaiting credential verification · Enter Token ID"}
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
      <div className="w-full pt-[16px] sm:pt-[24px] flex flex-col items-center px-4 sm:px-6 md:px-12 lg:px-16 z-[100] mb-4 sm:mb-8 shrink-0">
        <div className="w-full max-w-[1312px] flex items-center justify-between relative">
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[48px] sm:h-[56px] -ml-2 sm:-ml-6" onClick={() => navigate('/')}>
            <img 
              src="/tokcred_logo-removebg-preview.png" 
              alt="TokCred" 
              className="h-[75px] sm:h-[90px] lg:h-[120px] max-w-none object-contain relative transition-all duration-300" 
              style={{ filter: 'none' }}
            />
          </div>

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

          <div className="flex items-center gap-2 sm:gap-[16px]">
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
                buttonClassName="w-[44px] h-[44px] sm:w-[56px] sm:h-[56px] rounded-full flex items-center justify-center hover:opacity-80 transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] bg-white text-[#101014]"
                iconSize={20}
              />
            </div>

            <button 
              onClick={account ? disconnectWallet : () => connectWallet(false)} 
              title={account ? `Connected: ${account} (Click to disconnect)` : 'Connect Wallet'}
              className="h-[44px] sm:h-[56px] px-3 sm:px-[24px] text-[13px] sm:text-[15px] font-[500] rounded-full flex items-center gap-2 sm:gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(176,150,250,0.2)] bg-[#2D264B] text-white hover:bg-[#3C315B]"
            >
              {account ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-[44px] h-[44px] rounded-full flex items-center justify-center bg-white text-[#101014] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:opacity-80 transition-opacity"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden w-full max-w-[1312px] mt-3 p-3 bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl flex flex-col gap-1 z-[99]">
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
              className="flex items-center px-4 py-2.5 rounded-xl text-left text-[14px] font-medium text-[#292333] hover:bg-[#7053AD]/10 hover:text-[#513582] transition-colors"
            >
              Home
            </button>
            {Boolean(account && (isAdmin || isIssuer)) ? (
              <>
                <button 
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                  className="flex items-center px-4 py-2.5 rounded-xl text-left text-[14px] font-medium text-[#292333] hover:bg-[#7053AD]/10 hover:text-[#513582] transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); navigate('/issue'); }}
                  className="flex items-center px-4 py-2.5 rounded-xl text-left text-[14px] font-medium text-[#292333] hover:bg-[#7053AD]/10 hover:text-[#513582] transition-colors"
                >
                  Issue Credential
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); navigate('/history'); }}
                  className="flex items-center px-4 py-2.5 rounded-xl text-left text-[14px] font-medium text-[#292333] hover:bg-[#7053AD]/10 hover:text-[#513582] transition-colors"
                >
                  History
                </button>
              </>
            ) : Boolean(account) ? (
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/student-dashboard'); }}
                className="flex items-center px-4 py-2.5 rounded-xl text-left text-[14px] font-medium text-[#292333] hover:bg-[#7053AD]/10 hover:text-[#513582] transition-colors"
              >
                Student Dashboard
              </button>
            ) : null}
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/public-verify'); }}
              className="flex items-center px-4 py-2.5 rounded-xl text-left text-[14px] font-semibold text-[#513582] bg-[#7053AD]/10 transition-colors"
            >
              Public Verify
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center pt-4 sm:pt-[52px] pb-[48px] px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1440px] mx-auto w-full gap-8 sm:gap-10 relative">
        
        {!credential && !lookupError ? (
          /* Search / Entry State */
          <>
            <div className="flex flex-col lg:flex-row items-center justify-start gap-10 lg:gap-16 w-full max-w-[1312px]">
              <div className="flex flex-col items-start gap-4 w-full lg:w-[542px] shrink-0">
                <div className="flex items-center justify-start gap-[7px] px-[12px] sm:px-[15px] py-[8px] sm:py-[12px] bg-white/40 border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,1)] backdrop-blur-md rounded-full w-fit mb-1">
                  <Icons.Expand />
                  <span className="font-['Inter'] font-semibold text-[11px] sm:text-[14px] tracking-normal text-[#7053AD] uppercase whitespace-nowrap">
                    Public credential verification
                  </span>
                </div>

                <h1 className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[56px] lg:text-[72px] leading-[96%] tracking-[-1.5px] sm:tracking-[-2px] text-[#292333] mb-2">
                  Every<br/>achievement.<br/>Authentically<br/>theirs.
                </h1>
                
                <p className="font-['Inter'] text-[14px] sm:text-[15px] leading-[160%] text-[#5B5565] max-w-[360px]">
                  Confirm a Soulbound academic credential directly on-chain. Sensitive holder records remain AES-256-GCM encrypted until unlocked by an authorized wallet.
                </p>

                {/* Verification form */}
                <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-[438px] gap-3 mt-2 sm:mt-4">
                  <div className="flex flex-col gap-2 w-full">
                    <label className="font-['Inter'] font-semibold text-[14px] sm:text-[15px] text-[#292333]">Token ID</label>
                    <div className={`flex items-center gap-3 px-4 sm:px-5 py-[2px] h-[52px] sm:h-[56px] bg-white rounded-[12px] transition-all shadow-sm group ${validationError ? 'border-2 border-[#D92D20] ring-4 ring-[#D92D20]/10' : 'border border-[#E4DFE9] focus-within:border-[#7053AD] focus-within:ring-4 focus-within:ring-[#7053AD]/10'}`}>
                      <div className={validationError ? 'text-[#D92D20]' : 'text-[#9C95A5] group-focus-within:text-[#7053AD] transition-colors'}>
                        <Icons.Fingerprint />
                      </div>
                      <input
                        className="flex-1 bg-transparent border-none outline-none font-['IBM_Plex_Mono'] text-[14px] sm:text-[15px] text-[#292333] placeholder:text-[#9C95A5] h-full w-full"
                        placeholder="e.g. 0 or 1 (Token ID)"
                        type="text"
                        value={tokenId}
                        onChange={(e) => {
                          setTokenId(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        disabled={loading}
                      />
                    </div>
                    {validationError ? (
                      <p role="alert" className="font-['Inter'] text-[13px] font-medium text-[#D92D20] flex items-center gap-1.5 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{validationError}</span>
                      </p>
                    ) : (
                      <p className="font-['Inter'] text-[12px] sm:text-[13px] text-[#756F80]">Find this token ID on your certificate or QR verification link.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full h-[50px] sm:h-[54px] bg-gradient-to-r from-[#513582] to-[#110B1C] border border-[#1A1A1A] rounded-[12px] shadow-[0px_12px_24px_rgba(68,50,84,0.18)] hover:shadow-[0px_16px_32px_rgba(68,50,84,0.25)] active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
                  >
                    <span className="font-['Inter'] font-semibold text-[15px] sm:text-[17px] text-white">
                      {loading ? 'Verifying...' : 'Verify credential'}
                    </span>
                    {!loading && <Icons.ArrowRight />}
                  </button>
                </form>

                <p className="font-['Inter'] text-[12px] sm:text-[13px] text-[#756F80] mt-2 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E4DFE9]/50 w-full max-w-[438px]">
                  Free to verify · Soulbound wallet binding checked on-chain
                </p>
              </div>

              <div className="relative flex flex-col items-center justify-center w-full flex-1">
                <div className="absolute top-[5%] right-[10%] w-[320px] sm:w-[450px] h-[320px] sm:h-[450px] bg-white/50 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none z-0"></div>
                <div className="absolute bottom-[5%] left-[5%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[#E8DBC0]/40 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none z-0"></div>
                <div className="z-10 w-full flex justify-center">
                  <CertificatePreview isResult={false} />
                </div>
                <p className="font-['Inter'] text-[12px] sm:text-[13px] text-[#5B5565] text-center w-full mt-4 sm:mt-6 z-10">
                  A digital record. Bound to the holder’s wallet.
                </p>
              </div>
            </div>

            {/* Verification guidance */}
            <div className="flex flex-col md:flex-row items-start md:items-center p-5 sm:p-[28px] gap-6 sm:gap-8 w-full max-w-[1312px] bg-white/20 border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-lg">
              <div className="flex gap-3 flex-1">
                <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                  <Icons.Fingerprint />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-[13px] text-[#292333]">Unique Identity</h3>
                  <p className="text-[12px] leading-[160%] text-[#756F80]">Bound to the student’s Soulbound Ethereum wallet, enrollment number, and unique Credential ID.</p>
                </div>
              </div>
              <div className="flex gap-3 flex-1">
                <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                  <Icons.Landmark />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-[13px] text-[#292333]">Zero Plaintext on IPFS</h3>
                  <p className="text-[12px] leading-[160%] text-[#756F80]">Student name, enrollment no., degree, grade, field, and institution are encrypted via AES-256-GCM before IPFS pinning.</p>
                </div>
              </div>
              <div className="flex gap-3 flex-1">
                <div className="flex items-center justify-center w-9 h-9 bg-[#F5F1FA] rounded-[10px] shrink-0">
                  <Icons.ShieldCheck />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-[13px] text-[#292333]">Wallet-Authorized Reveal</h3>
                  <p className="text-[12px] leading-[160%] text-[#756F80]">Confirm on-chain status publicly, or unlock encrypted details using the holder or issuer wallet.</p>
                </div>
              </div>
            </div>
          </>
        ) : lookupError ? (
          /* Lookup Error State */
          <div className="flex flex-col items-start gap-[24px] w-full max-w-[1312px]">
            <button onClick={resetVerification} className="flex items-center gap-[8px] font-['Inter'] text-[20px] text-[#1A1A1A] hover:text-[#7053AD] transition-colors h-[24px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verify another credential
            </button>

            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-[64px] w-full">
              <div className="flex flex-col items-start gap-[22px] w-full lg:w-[438px] shrink-0">
                <div className="flex items-center gap-[7px] px-[12px] py-[7px] bg-[rgba(255,59,48,0.12)] border border-[rgba(255,59,48,0.3)] rounded-full h-[39px]">
                  <div className="w-[15px] h-[15px] rounded-full border-[1.6px] border-[#D92D20] flex items-center justify-center">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D92D20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                  <span className="font-['Inter'] font-semibold text-[14px] sm:text-[15px] leading-[18px] text-[#D92D20]">
                    {errorTitle}
                  </span>
                </div>
                
                <h1 className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[54px] lg:text-[64px] leading-[102%] tracking-[-1.5px] text-[#292333]">
                  {errorTitle === 'Credential not found' ? <>No record<br/>found.</> : <>Lookup<br/>failed.</>}
                </h1>
                <p className="font-['Inter'] text-[14px] sm:text-[15px] leading-[170%] text-[#756F80]">
                  {lookupError}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full mt-2 max-w-[438px]">
                  <label className="font-['Inter'] font-semibold text-[14px] sm:text-[15px] text-[#292333]">Token ID</label>
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-[2px] h-[52px] sm:h-[56px] bg-white border border-[#D92D20] rounded-[12px] focus-within:ring-4 focus-within:ring-[#D92D20]/10 transition-all shadow-sm group">
                    <div className="text-[#D92D20]"><Icons.Fingerprint /></div>
                    <input
                      className="flex-1 bg-transparent border-none outline-none font-['IBM_Plex_Mono'] text-[14px] sm:text-[15px] text-[#292333] placeholder:text-[#9C95A5] h-full w-full"
                      type="text"
                      placeholder="e.g. 0 or 1"
                      value={tokenId}
                      onChange={(e) => {
                        setTokenId(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      disabled={loading}
                    />
                  </div>
                  {validationError && (
                    <p role="alert" className="font-['Inter'] text-[13px] font-medium text-[#D92D20] flex items-center gap-1.5 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{validationError}</span>
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full h-[50px] sm:h-[54px] bg-gradient-to-r from-[#513582] to-[#110B1C] border border-[#1A1A1A] rounded-[12px] shadow-[0px_12px_24px_rgba(68,50,84,0.18)] hover:shadow-[0px_16px_32px_rgba(68,50,84,0.25)] active:scale-[0.98] transition-all disabled:opacity-70 mt-2"
                  >
                    <span className="font-['Inter'] font-semibold text-[15px] sm:text-[17px] text-white">
                      {loading ? 'Verifying...' : 'Verify another ID'}
                    </span>
                    {!loading && <Icons.ArrowRight />}
                  </button>
                </form>

                <div className="flex flex-col items-start p-5 sm:p-[24px] gap-[16px] w-full max-w-[438px] bg-[rgba(255,255,255,0.3)] border border-[#E4DFE9] rounded-[16px] mt-2 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                  <h3 className="font-['Inter'] font-semibold text-[15px] sm:text-[16px] text-[#292333]">Troubleshooting tips</h3>
                  <ul className="list-disc pl-5 font-['Inter'] text-[13px] sm:text-[14px] leading-[160%] text-[#756F80] flex flex-col gap-2">
                    <li>Ensure you entered a numeric token ID (starting from 0).</li>
                    <li>Confirm you are checking against Ethereum Sepolia testnet.</li>
                    <li>Contact the issuing institution if the record was issued recently.</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-[16px] w-full lg:w-[810px] flex-1">
                <div className="flex flex-col items-center justify-center w-full max-w-[706px] min-h-[360px] sm:min-h-[460px] p-4 sm:p-8 rounded-[24px] sm:rounded-[28px] relative overflow-hidden isolate"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
                    backdropFilter: 'blur(40px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 40px 80px -12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.7)'
                  }}
                >
                  <div className="absolute top-[-10%] right-[-10%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-red-500/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
                  <div className="flex flex-col items-start p-5 sm:p-[32px] gap-4 sm:gap-[24px] w-full max-w-[440px] bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-10 border border-[#E4DFE9]/50">
                    <div className="flex items-center gap-[12px]">
                      <div className="flex items-center justify-center w-10 h-10 bg-[#F5F1FA] rounded-[10px]">
                        <Icons.Eye />
                      </div>
                      <h3 className="font-['Inter'] font-semibold text-[17px] sm:text-[18px] text-[#292333]">Verification inquiry</h3>
                    </div>
                    <div className="flex flex-col gap-[6px] sm:gap-[8px] w-full border-t border-[#E4DFE9] pt-[14px] sm:pt-[16px]">
                      <span className="font-['Inter'] text-[13px] sm:text-[14px] text-[#756F80]">Submitted ID</span>
                      <span className="font-['IBM_Plex_Mono'] text-[15px] sm:text-[16px] text-[#292333] break-all">{tokenId}</span>
                    </div>
                    <div className="flex flex-col gap-[6px] sm:gap-[8px] w-full border-t border-[#E4DFE9] pt-[14px] sm:pt-[16px]">
                      <span className="font-['Inter'] text-[13px] sm:text-[14px] text-[#756F80]">Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-[12px] h-[12px] rounded-full bg-[#D92D20] shrink-0"></div>
                        <span className="font-['Inter'] font-medium text-[14px] sm:text-[15px] text-[#D92D20]">{lookupError}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Result State */
          <div className="flex flex-col items-start gap-[24px] w-full max-w-[1312px]">
            <button onClick={resetVerification} className="flex items-center gap-[8px] font-['Inter'] text-[17px] sm:text-[20px] text-[#1A1A1A] hover:text-[#7053AD] transition-colors h-[24px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verify another credential
            </button>

            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-[64px] w-full">
              
              {/* Left Column: On-Chain Ownership & Confidential Unlock */}
              <div className="flex flex-col items-start gap-[18px] sm:gap-[22px] w-full lg:w-[438px] shrink-0">
                
                {/* Status badge */}
                {isRevoked ? (
                  <div className="flex items-center gap-[7px] px-[12px] py-[7px] bg-[rgba(255,59,48,0.14)] border border-[rgba(255,59,48,0.32)] rounded-full h-[39px]">
                    <div className="w-[15px] h-[15px] rounded-full border-[1.6px] border-[#D92D20] flex items-center justify-center">
                      <X className="w-2.5 h-2.5 text-[#D92D20]" strokeWidth={3} />
                    </div>
                    <span className="font-['Inter'] font-semibold text-[14px] sm:text-[15px] leading-[18px] text-[#D92D20]">
                      Revoked by issuer
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-[7px] px-[12px] py-[7px] bg-[rgba(52,199,89,0.41)] rounded-full h-[39px]">
                    <div className="w-[15px] h-[15px] rounded-full border-[1.6px] border-[#326956] flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#326956" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="font-['Inter'] font-semibold text-[14px] sm:text-[15px] leading-[18px] text-[#1F1F1F]">
                      Verified Soulbound Token
                    </span>
                  </div>
                )}

                {isRevoked ? (
                  <h1 className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[52px] lg:text-[64px] leading-[102%] tracking-[-1.5px] text-[#D92D20]">
                    Credential<br/>revoked.
                  </h1>
                ) : (
                  <h1 className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[52px] lg:text-[64px] leading-[102%] tracking-[-1.5px] text-[#292333]">
                    An authentic<br/>achievement.
                  </h1>
                )}

                <p className="font-['Inter'] text-[14px] sm:text-[15px] leading-[170%] text-[#5B5565]">
                  {isRevoked
                    ? 'This Soulbound credential was permanently revoked on-chain and is no longer valid.'
                    : `Verified on Ethereum Sepolia as a non-transferable Soulbound ERC-721 credential owned by wallet ${shortHolderWallet}.`}
                </p>

                {/* Soulbound Ownership & Identity Summary Card */}
                <div className="flex flex-col items-start p-5 sm:p-[26px] gap-[16px] w-full max-w-[438px] bg-[rgba(255,255,255,0.28)] border border-white/75 rounded-[18px] backdrop-blur-md">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-['Cormorant_Garamond'] text-[24px] leading-none text-[#292333]">
                      On-Chain Identity &amp; Record
                    </h3>
                    <span className="font-['IBM_Plex_Mono'] text-[10px] px-2.5 py-0.5 rounded-full bg-[#513582]/10 text-[#513582] font-semibold">
                      {isEncryptedRecord ? 'AES-256-GCM' : 'Legacy Record'}
                    </span>
                  </div>

                  {/* Holder Wallet Binding Row */}
                  <div className="w-full p-3 rounded-xl bg-white/50 border border-white/80 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] text-[#756F80]">
                      <span className="font-medium flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        Soulbound Holder Wallet
                      </span>
                      <span className="font-['IBM_Plex_Mono'] text-[10px] text-emerald-700 font-semibold">
                        {credential?.ownerMatchesStudent ? 'Owner Verified' : 'Bound'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#292333] break-all">
                        {resolvedHolderWallet}
                      </span>
                      {resolvedHolderWallet && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(resolvedHolderWallet, 'holder')}
                          className="text-[#7053AD] hover:text-[#513582] p-1 shrink-0"
                          title="Copy holder wallet address"
                        >
                          {copiedField === 'holder' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Credential ID + Issued Date */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col gap-1">
                      <span className="font-['Inter'] text-[12px] text-[#756F80]">Unique Credential ID</span>
                      <span className="font-['IBM_Plex_Mono'] text-[13px] font-semibold text-[#513582] break-all">
                        {resolvedCredentialId}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-['Inter'] text-[12px] text-[#756F80]">Issued on</span>
                      <span className="font-['Inter'] font-medium text-[14px] text-[#292333]">
                        {formatDate(credential.issueTimestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Encrypted vs Unlocked Academic Fields */}
                  {isLockedEncrypted ? (
                    <div className="w-full p-4 rounded-xl bg-[#513582]/8 border border-[#513582]/20 flex flex-col gap-3">
                      <div className="flex items-start gap-2.5 text-[12px] text-[#292333]">
                        <Lock className="w-4 h-4 text-[#513582] shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[#513582]">Protected Confidential Metadata</span>
                          <span className="text-[#5B5565] leading-relaxed">
                            Student legal name, enrollment no., degree, branch, grade, and institution are encrypted on public IPFS. Unlock with the holder or authorized issuer wallet.
                          </span>
                        </div>
                      </div>

                      {decryptionError && (
                        <div className="p-2.5 rounded-lg bg-[#98514C]/10 border border-[#98514C]/25 text-[#98514C] text-[11px]">
                          {decryptionError}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleUnlockEncrypted}
                        disabled={decrypting || web3Loading}
                        className="w-full h-[44px] rounded-xl bg-[#2D264B] hover:bg-[#3C315B] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                      >
                        {account ? <Unlock className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                        <span>
                          {decrypting
                            ? 'Verifying Wallet Signature...'
                            : account
                              ? 'Unlock Encrypted Details'
                              : 'Connect Holder Wallet to Unlock'}
                        </span>
                      </button>
                    </div>
                  ) : isMetadataUnavailable ? (
                    <div className="w-full p-3.5 rounded-xl bg-amber-500/10 border border-amber-600/25 text-[12px] text-amber-900">
                      IPFS metadata is temporarily unreachable from public gateways. On-chain token validity and Soulbound owner wallet remain verified above.
                    </div>
                  ) : (
                    <>
                      <div className="w-full h-[1px] bg-[#E4DFE9]" />
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col gap-1">
                          <span className="font-['Inter'] text-[12px] text-[#756F80]">Student Name</span>
                          <span className="font-['Inter'] font-semibold text-[15px] text-[#292333] break-words">
                            {effectiveMeta?.studentName || shortHolderWallet}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-['Inter'] text-[12px] text-[#756F80]">Enrollment / Reg. No.</span>
                          <span className="font-['IBM_Plex_Mono'] text-[13px] font-medium text-[#292333] break-words">
                            {resolvedEnrollmentNumber || 'Legacy Record'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col gap-1">
                          <span className="font-['Inter'] text-[12px] text-[#756F80]">Award / Degree</span>
                          <span className="font-['Inter'] font-medium text-[14px] text-[#292333]">
                            {effectiveMeta?.degree || 'Academic Credential'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-['Inter'] text-[12px] text-[#756F80]">Branch / Field</span>
                          <span className="font-['Inter'] font-medium text-[14px] text-[#292333]">
                            {effectiveMeta?.branch || effectiveMeta?.fieldOfStudy || effectiveMeta?.field || 'Academic Program'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col gap-1">
                          <span className="font-['Inter'] text-[12px] text-[#756F80]">Institution</span>
                          <span className="font-['Inter'] font-medium text-[14px] text-[#292333]">
                            {effectiveMeta?.institution || 'Issuing Authority'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-['Inter'] text-[12px] text-[#756F80]">Grade</span>
                          <span className="font-['Inter'] font-medium text-[14px] text-[#292333]">
                            {effectiveMeta?.grade || 'Honors'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="w-full h-[1px] bg-[#E4DFE9]" />
                  <div className="flex flex-col gap-1 w-full">
                    <span className="font-['Inter'] text-[12px] text-[#756F80]">Registry Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isRevoked ? 'bg-[#D92D20]' : 'bg-[#34C759]'}`}></div>
                      <span className={`font-['Inter'] font-semibold text-[14px] ${isRevoked ? 'text-[#D92D20]' : 'text-[#326956]'}`}>
                        {isRevoked ? 'Revoked (Permanently Invalidated)' : 'Valid · Soulbound Owner Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blockchain Details Trigger */}
                <button
                  id="blockchain-details-trigger"
                  type="button"
                  onClick={() => setShowBlockchainModal(true)}
                  className="w-full max-w-[438px] flex items-center justify-between p-[14px_18px] sm:p-[18px_24px] bg-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.38)] border border-white/75 rounded-[16px] backdrop-blur-md shadow-sm transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/60 border border-[#E4DFE9] flex items-center justify-center text-[#513582] group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                      <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-['Inter'] font-semibold text-[15px] sm:text-[16px] text-[#292333] group-hover:text-[#513582] transition-colors">
                      Blockchain details
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-[#E4DFE9] text-[12px] font-['Inter'] font-medium text-[#513582] group-hover:bg-[#513582] group-hover:text-white transition-all shrink-0 shadow-sm">
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Right Column: Certificate Preview & Actions */}
              <div className="flex flex-col items-center lg:items-end gap-[16px] w-full lg:w-[810px] flex-1">
                <div className="w-full max-w-[706px] flex justify-center">
                  <CertificatePreview isResult={true} />
                </div>

                <div className="flex flex-col items-start gap-[16px] w-full max-w-[706px]">
                  {isRevoked ? (
                    <div className="flex flex-col items-start p-[14px_16px] sm:p-[16px_20px] gap-[8px] w-full bg-[rgba(254,242,242,0.7)] border border-red-200/80 rounded-[10px]">
                      <div className="flex flex-row items-center gap-[8px]">
                        <X className="w-4 h-4 text-[#D92D20]" />
                        <span className="font-['Inter'] font-semibold text-[13px] sm:text-[14px] text-[#D92D20]">
                          Revocation permanently anchored on Sepolia
                        </span>
                      </div>
                      <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#9C3834]">
                        Reference {verificationRef} · Holder {shortHolderWallet}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start p-[14px_16px] sm:p-[16px_20px] gap-[8px] w-full bg-[rgba(233,243,238,0.35)] border border-emerald-700/15 rounded-[10px]">
                      <div className="flex flex-row items-center gap-[8px]">
                        <KeyRound className="w-4 h-4 text-[#326956]" />
                        <span className="font-['Inter'] font-semibold text-[13px] sm:text-[14px] text-[#326956]">
                          On-chain Soulbound owner &amp; credential record verified
                        </span>
                      </div>
                      <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#326956]">
                        Reference {verificationRef} · {isEncryptedRecord ? (decryptedData ? 'Decrypted for Authorized Wallet' : 'AES-256-GCM Encrypted on IPFS') : 'Legacy IPFS Record'}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                    {isRevoked ? (
                      <button 
                        id="download-certificate-button"
                        type="button"
                        disabled={true}
                        className="flex flex-row justify-center items-center px-[20px] gap-[10px] flex-1 h-[50px] bg-[#E8E4EB] border border-[#D5D0DC] rounded-[10px] cursor-not-allowed"
                      >
                        <span className="font-['Inter'] font-semibold text-[14px] text-[#8C827A]">
                          Download disabled · Revoked
                        </span>
                        <Lock className="w-4 h-4 text-[#8C827A]" />
                      </button>
                    ) : isLockedEncrypted || isMetadataUnavailable ? (
                      <button
                        id="download-certificate-button"
                        type="button"
                        onClick={isLockedEncrypted ? handleUnlockEncrypted : undefined}
                        disabled={!isLockedEncrypted || decrypting}
                        className="flex flex-row justify-center items-center px-[20px] gap-[10px] flex-1 h-[50px] bg-[#2D264B] hover:bg-[#3C315B] text-white rounded-[10px] transition-all cursor-pointer disabled:opacity-60"
                      >
                        <Lock className="w-4 h-4" />
                        <span className="font-['Inter'] font-semibold text-[14px]">
                          {isMetadataUnavailable ? 'PDF Unavailable (Metadata Offline)' : 'Unlock with Wallet to Download PDF'}
                        </span>
                      </button>
                    ) : (
                      <button 
                        id="download-certificate-button"
                        type="button"
                        onClick={handleDownloadCertificate}
                        disabled={downloading}
                        className="flex flex-row justify-center items-center px-[20px] gap-[10px] flex-1 h-[50px] bg-gradient-to-r from-[#513582] to-[#110B1C] border border-[#513582] rounded-[10px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-sm"
                      >
                        <span className="font-['Inter'] font-semibold text-[15px] sm:text-[16px] text-white">
                          {downloading ? 'Generating PDF...' : 'Download certificate'}
                        </span>
                        {downloading ? (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                        ) : (
                          <Icons.Download />
                        )}
                      </button>
                    )}

                    <button 
                      onClick={handleCopy}
                      className="flex flex-row justify-center items-center px-[20px] gap-[10px] sm:w-[160px] h-[50px] bg-white/40 hover:bg-white/60 border border-white/60 rounded-[10px] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                    >
                      <span className="font-['Inter'] font-medium text-[14px] sm:text-[15px] text-[#292333]">
                        {copied ? 'Copied link!' : 'Share link'}
                      </span>
                      {copied ? <Icons.CheckCircle /> : <Icons.LinkIcon />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Blockchain Details Popup Modal */}
      {showBlockchainModal && credential && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          onClick={() => setShowBlockchainModal(false)}
        >
          <div 
            className="relative w-full max-w-[540px] rounded-[24px] bg-[rgba(255,255,255,0.62)] border border-[rgba(255,255,255,0.85)] p-6 sm:p-7 shadow-[0_24px_60px_rgba(41,35,51,0.18)] backdrop-blur-2xl flex flex-col gap-5 text-[#292333]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E4DFE9]/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/70 border border-[#E4DFE9] flex items-center justify-center text-[#513582] shadow-sm">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cormorant_Garamond'] text-[26px] font-semibold leading-tight text-[#292333]">
                    Blockchain Details
                  </h3>
                  <p className="font-['Inter'] text-[12px] text-[#756F80]">
                    On-chain Soulbound verification on Ethereum Sepolia
                  </p>
                </div>
              </div>
              <button
                id="close-blockchain-modal"
                type="button"
                onClick={() => setShowBlockchainModal(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#756F80] hover:text-[#292333] border border-[#E4DFE9] shadow-sm flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5 p-3.5 bg-white/55 border border-white/80 rounded-[14px]">
                <span className="font-['Inter'] text-[12px] font-medium text-[#756F80]">
                  Token ID &amp; Credential ID
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-['IBM_Plex_Mono'] text-[15px] font-semibold text-[#513582]">
                    #{credential?.tokenId?.toString()} · {resolvedCredentialId}
                  </span>
                  <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#7053AD] bg-[#7053AD]/10 px-2.5 py-0.5 rounded-full font-medium">
                    ERC-721 Soulbound
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-3.5 bg-white/55 border border-white/80 rounded-[14px]">
                <div className="flex items-center justify-between">
                  <span className="font-['Inter'] text-[12px] font-medium text-[#756F80]">
                    Bound Student Wallet (ownerOf)
                  </span>
                  {resolvedHolderWallet && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(resolvedHolderWallet, 'student')}
                      className="text-[11px] font-medium text-[#7053AD] hover:text-[#513582] flex items-center gap-1"
                    >
                      {copiedField === 'student' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'student' ? 'Copied' : 'Copy Address'}</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#292333] break-all select-all">
                    {resolvedHolderWallet || 'Not specified'}
                  </span>
                  {resolvedHolderWallet && (
                    <a
                      href={`https://sepolia.etherscan.io/address/${resolvedHolderWallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-[#7053AD] hover:text-[#513582] shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-3.5 bg-white/55 border border-white/80 rounded-[14px]">
                <span className="font-['Inter'] text-[12px] font-medium text-[#756F80]">
                  IPFS Payload URI ({isEncryptedRecord ? 'AES-256-GCM Ciphertext Only' : 'Legacy JSON'})
                </span>
                <a
                  href={credential?.metadataURI ? ipfsToHttp(credential.metadataURI) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-['IBM_Plex_Mono'] text-[12px] text-[#513582] hover:underline break-all"
                >
                  {credential?.metadataURI || 'N/A'}
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://sepolia.etherscan.io/nft/${CONTRACT_ADDRESS}/${credential?.tokenId?.toString() || '0'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[42px] px-3 bg-[#513582] hover:bg-[#41276b] text-white rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Token on Etherscan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[42px] px-3 bg-white/75 hover:bg-white text-[#292333] border border-[#E4DFE9] rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Smart Contract</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicVerify;
