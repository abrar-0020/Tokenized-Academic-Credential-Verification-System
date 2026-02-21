import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import jsPDF from 'jspdf';
import { formatDate, ipfsToHttp } from '../utils/helpers';

// Module-level ENS cache + mainnet provider
const ensCache = new Map();
let mainnetProvider = null;
const getMainnetProvider = () => {
  if (!mainnetProvider) {
    try {
      mainnetProvider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    } catch {}
  }
  return mainnetProvider;
};

const resolveENS = async (address) => {
  if (!address) return null;
  if (ensCache.has(address)) return ensCache.get(address);
  try {
    const provider = getMainnetProvider();
    if (!provider) return null;
    const name = await Promise.race([
      provider.lookupAddress(address),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000)),
    ]);
    ensCache.set(address, name || null);
    return name || null;
  } catch {
    ensCache.set(address, null);
    return null;
  }
};

const CredentialCard = ({ credential, metadata, onRevoke, showActions = false }) => {
  const [ensName, setEnsName] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (credential?.student) {
      resolveENS(credential.student).then(setEnsName);
    }
  }, [credential?.student]);

  const studentDisplay = ensName
    ? ensName
    : credential?.student
      ? `${credential.student.substring(0, 8)}...${credential.student.substring(credential.student.length - 6)}`
      : 'Not Specified';

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();

      // Header bar
      doc.setFillColor(2, 132, 199); // sky-600
      doc.rect(0, 0, pageW, 28, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TokCred - Academic Credential', pageW / 2, 12, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Blockchain-Verified Certificate', pageW / 2, 20, { align: 'center' });

      // Status badge
      const isRevoked = credential?.revoked;
      doc.setFillColor(isRevoked ? 239 : 16, isRevoked ? 68 : 185, isRevoked ? 68 : 129);
      doc.roundedRect(14, 34, 40, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(isRevoked ? 'REVOKED' : 'VALID', 34, 39.5, { align: 'center' });

      // Token ID
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Token ID: #${credential?.tokenId?.toString() || 'N/A'}`, pageW - 14, 39, { align: 'right' });

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 46, pageW - 14, 46);

      // Credential name
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const credName = metadata?.degree || metadata?.name || 'Academic Credential';
      doc.text(credName, pageW / 2, 58, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(metadata?.institution || 'Institution Not Specified', pageW / 2, 67, { align: 'center' });

      // Details grid
      const fields = [
        ['Student Name', metadata?.studentName || 'Not Specified'],
        ['Student Wallet', ensName || (credential?.student ? `${credential.student.substring(0, 16)}...` : 'N/A')],
        ['Grade / GPA', metadata?.grade || 'Not Specified'],
        ['Issue Date', metadata?.issueDate || formatDate(credential?.issueTimestamp)],
        ['Description', metadata?.description || '-'],
      ];

      let y = 82;
      fields.forEach(([label, value]) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, pageW - 28, 12, 1.5, 1.5, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), 19, y + 5);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const val = doc.splitTextToSize(String(value), pageW - 60);
        doc.text(val[0] || '', 19, y + 9.5);
        y += 16;
      });

      // Verification URL
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, pageW - 14, y);
      y += 8;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Verify online (no wallet needed):', 14, y);
      doc.setTextColor(2, 132, 199);
      const verifyUrl = `${window.location.origin}/public-verify?tokenId=${credential?.tokenId?.toString()}`;
      doc.text(verifyUrl, 14, y + 5);

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 12;
      doc.setFillColor(248, 250, 252);
      doc.rect(0, footerY - 4, pageW, 16, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated by TokCred on ${new Date().toLocaleDateString()}  |  Blockchain-verified credential`,
        pageW / 2,
        footerY + 2,
        { align: 'center' }
      );

      doc.save(`tokcred-credential-${credential?.tokenId?.toString() || 'export'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 w-full overflow-hidden transition-shadow" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full">
        {/* Credential Badge */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-sky-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-md">
            {metadata?.image ? (
              <img
                src={ipfsToHttp(metadata.image)}
                alt="Credential"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L2 8l10 5 10-5-10-5z" fill="white"/><path d="M2 8v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 10.5v4c0 1.657 2.686 3 6 3s6-1.343 6-3v-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )}
          </div>
        </div>

        {/* Credential Details */}
        <div className="flex-grow min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <div className="min-w-0 overflow-hidden">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                {metadata?.degree || metadata?.name || 'Academic Credential'}
              </h3>
              <p className="text-sm text-slate-500 break-words">{metadata?.institution || 'Institution Not Specified'}</p>
            </div>
            {credential.revoked ? (
              <span className="badge badge-danger">Revoked</span>
            ) : (
              <span className="badge badge-success">Valid</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-3">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Student</p>
              <p className="text-sm font-semibold text-slate-800 break-words mt-0.5">{metadata?.studentName || 'Not Specified'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Grade</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{metadata?.grade || 'Not Specified'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Issue Date</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {metadata?.issueDate || formatDate(credential.issueTimestamp)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Token ID</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">#{credential.tokenId.toString()}</p>
            </div>
          </div>

          {/* ENS Address row */}
          <div className="mt-2.5 bg-slate-50 rounded-xl p-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Wallet Address</p>
            <p className="text-xs font-mono text-slate-700 mt-0.5 break-all">
              {ensName ? (
                <span>
                  <span className="text-primary-600 font-semibold">{ensName}</span>
                  <span className="text-slate-400 ml-1">({`${credential.student.substring(0, 8)}...${credential.student.substring(credential.student.length - 6)}`})</span>
                </span>
              ) : (
                studentDisplay
              )}
            </p>
          </div>

          {metadata?.description && (
            <div className="mt-2.5">
              <p className="text-xs text-slate-500 leading-relaxed">{metadata.description}</p>
            </div>
          )}

          {/* Action bar */}
          <div className="mt-3 flex flex-wrap gap-2 sm:gap-3 pt-3 border-t border-slate-100 items-center">
            {/* PDF Download - always shown */}
            <button
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="text-xs font-semibold text-slate-600 hover:text-primary-600 border border-slate-200 hover:border-primary-300 px-2.5 py-1 rounded-lg transition-all bg-white"
            >
              {pdfLoading ? 'Generating...' : 'Download PDF'}
            </button>

            {/* Public verify link */}
            <a
              href={`/public-verify?tokenId=${credential.tokenId.toString()}`}
              className="text-xs font-semibold text-slate-600 hover:text-primary-600 border border-slate-200 hover:border-primary-300 px-2.5 py-1 rounded-lg transition-all bg-white"
            >
              Public Link
            </a>

            {showActions && !credential.revoked && (
              <>
                <a
                  href={ipfsToHttp(credential.metadataURI)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  View Metadata â†—
                </a>
                {onRevoke && (
                  <button
                    onClick={() => onRevoke(credential.tokenId)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Revoke
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialCard;
