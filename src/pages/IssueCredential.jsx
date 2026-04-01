import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { isValidAddress } from '../utils/helpers';
import ObsidianShell from '../components/ObsidianShell';
import { issueCredential as issueCredentialAction } from '../logic';

const IssueCredential = () => {
  const { account, contract, isIssuer } = useWeb3();

  const [formData, setFormData] = useState({
    studentAddress: '',
    studentName: '',
    institution: '',
    degree: '',
    grade: '',
    issueDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!isValidAddress(formData.studentAddress)) {
      setError('Invalid student wallet address');
      return;
    }

    if (!formData.studentName || !formData.institution || !formData.degree) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const pinataKey = import.meta.env.VITE_PINATA_API_KEY;
      const pinataSecret = import.meta.env.VITE_PINATA_API_SECRET;
      const { tokenId } = await issueCredentialAction({
        contract,
        studentAddress: formData.studentAddress,
        formData,
        pinataKey,
        pinataSecret,
      });

      setSuccess(`Credential successfully issued! Token ID: ${tokenId}`);

      setFormData({
        studentAddress: '',
        studentName: '',
        institution: '',
        degree: '',
        grade: '',
        issueDate: new Date().toISOString().split('T')[0],
        description: '',
      });

    } catch (err) {
      setError(err.message || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ObsidianShell title="Issue Credential" subtitle="Minting Workflow">
      {!account && <Alert type="warning" message="Please connect your wallet to continue" />}
      {account && !isIssuer && (
        <Alert
          type="error"
          message="Access Denied: You do not have permission to issue credentials. Only authorized issuers can access this page."
        />
      )}

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-10">
          <header className="space-y-4">
            <h1 className="text-5xl font-headline font-medium tracking-tight text-[#c6c6c7] leading-tight">
              Issue New <br />Digital Credential
            </h1>
            <p className="text-[#acabaa] max-w-md leading-relaxed">
              Mint immutable academic records on the decentralized ledger, secured by cryptographic proof.
            </p>
          </header>

          <div className="flex gap-4 items-center max-w-sm">
            <div className="flex-1 h-[2px] bg-[#8197ff] shadow-[0_0_8px_rgba(129,151,255,0.5)]"></div>
            <div className="flex-1 h-[2px] bg-[#1f2020]"></div>
            <div className="flex-1 h-[2px] bg-[#1f2020]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-xs font-headline font-bold text-[#8197ff] tracking-widest uppercase">Step 01</span>
                <h3 className="text-lg font-headline text-[#c6c6c7]">Student Identity</h3>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <label className="block text-[11px] font-label font-semibold text-[#acabaa] uppercase tracking-wider mb-2">Full Legal Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full bg-[#131313] border-0 border-b border-[#484848]/30 py-4 px-0 text-[#c6c6c7] placeholder:text-[#767575] focus:ring-0 focus:border-[#8197ff] transition-all"
                    placeholder="e.g. Alexander Sterling"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label font-semibold text-[#acabaa] uppercase tracking-wider mb-2">Student Wallet Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="studentAddress"
                      value={formData.studentAddress}
                      onChange={handleChange}
                      className="w-full bg-[#131313] border-0 border-b border-[#484848]/30 py-4 px-0 text-[#c6c6c7] placeholder:text-[#767575] focus:ring-0 focus:border-[#8197ff] transition-all"
                      placeholder="0x..."
                      required
                    />
                    <span className="material-symbols-outlined absolute right-0 top-4 text-[#767575] text-lg">account_balance_wallet</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-xs font-headline font-bold text-[#8197ff] tracking-widest uppercase">Step 02</span>
                <h3 className="text-lg font-headline text-[#c6c6c7]">Academic Record</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-label font-semibold text-[#acabaa] uppercase tracking-wider mb-2">Degree / Certification</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full bg-[#131313] border-0 border-b border-[#484848]/30 py-4 px-0 text-[#c6c6c7] placeholder:text-[#767575] focus:ring-0 focus:border-[#8197ff] transition-all"
                    placeholder="BSc Computer Science"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label font-semibold text-[#acabaa] uppercase tracking-wider mb-2">Grade / GPA</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full bg-[#131313] border-0 border-b border-[#484848]/30 py-4 px-0 text-[#c6c6c7] placeholder:text-[#767575] focus:ring-0 focus:border-[#8197ff] transition-all"
                    placeholder="First Class Honours"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label font-semibold text-[#acabaa] uppercase tracking-wider mb-2">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="w-full bg-[#131313] border-0 border-b border-[#484848]/30 py-4 px-0 text-[#c6c6c7] placeholder:text-[#767575] focus:ring-0 focus:border-[#8197ff] transition-all"
                    placeholder="Aetheria Academy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label font-semibold text-[#acabaa] uppercase tracking-wider mb-2">Completion Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="w-full bg-[#131313] border-0 border-b border-[#484848]/30 py-4 px-0 text-[#c6c6c7] focus:ring-0 focus:border-[#8197ff] transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-label font-semibold text-[#acabaa] uppercase tracking-wider mb-2">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-[#131313] border-0 border-b border-[#484848]/30 py-4 px-0 text-[#c6c6c7] placeholder:text-[#767575] focus:ring-0 focus:border-[#8197ff] transition-all"
                    placeholder="Optional details"
                  />
                </div>
              </div>
            </section>

            <div className="pt-4 flex items-center justify-between">
              <button type="button" className="text-[#acabaa] font-headline font-medium text-sm hover:text-[#c6c6c7] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading || !account || !isIssuer}
                className="bg-gradient-to-br from-[#8197ff] to-[#002ca3] px-10 py-4 rounded-md text-[#001661] font-headline font-bold text-sm tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                {loading ? 'Minting...' : 'Generate Preview'}
              </button>
            </div>
          </form>

          {loading && (
            <div className="mt-6">
              <Loading message="Processing transaction... Please wait and do not close this page." />
            </div>
          )}
        </div>

        <div className="lg:col-span-5 sticky top-32">
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#8197ff]/5 rounded-[2rem] blur-3xl group-hover:bg-[#8197ff]/10 transition-all duration-700"></div>
            <div className="relative bg-[#1f2020] rounded-xl overflow-hidden border border-[#484848]/20 aspect-[3/4] flex flex-col">
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="w-12 h-12 bg-[#252626] flex items-center justify-center rounded-lg border border-[#484848]/20">
                    <span className="material-symbols-outlined text-[#8197ff]" style={{ fontVariationSettings: '"FILL" 1' }}>history_edu</span>
                  </div>
                  <p className="text-[10px] text-[#acabaa] font-headline tracking-[0.3em] uppercase pt-4">Official Record</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-[#252626] text-[#c6c6c7] text-[10px] font-bold rounded-full border border-[#484848]/10">
                    ID: {Date.now().toString().slice(-6)}
                  </span>
                </div>
              </div>

              <div className="px-8 flex-grow flex flex-col justify-end pb-12">
                <h4 className="text-4xl font-headline font-extrabold text-[#c6c6c7] leading-none mb-2 tracking-tighter">
                  {(formData.studentName || 'Student')} 
                </h4>
                <p className="text-[#8197ff] text-sm font-headline tracking-wide mb-8">{formData.degree || 'Degree Preview'}</p>
                <div className="space-y-4 pt-6 border-t border-[#484848]/20">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] text-[#acabaa] uppercase tracking-widest mb-1">Status</p>
                      <p className="text-xs font-bold text-[#c6c6c7] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8197ff] shadow-[0_0_8px_#8197ff]"></span>
                        DRAFT PREVIEW
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-[#acabaa] uppercase tracking-widest mb-1">Node Origin</p>
                      <p className="text-xs font-medium text-[#c6c6c7]">Archivist_Node_04</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-2 bg-gradient-to-r from-[#002ca3] via-[#8197ff] to-[#002ca3]"></div>
            </div>

            <div className="mt-8 bg-[#131313] p-6 rounded-lg border border-[#484848]/10">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#acabaa] mt-1">info</span>
                <div className="space-y-1">
                  <p className="text-xs font-headline font-bold text-[#c6c6c7]">Cryptographic Verification</p>
                  <p className="text-[11px] text-[#acabaa] leading-relaxed">
                    This card uses ERC-721 Soulbound logic. Once minted, the credential is permanently bound to the student identity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ObsidianShell>
  );
};

export default IssueCredential;
