import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

const NEWSLETTER_STORAGE_KEY = 'tokcred-newsletter-email';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GITHUB_REPO_URL = 'https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System';

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [email, setEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NEWSLETTER_STORAGE_KEY);
      if (saved && EMAIL_REGEX.test(saved)) {
        setSubscribedEmail(saved);
      }
    } catch {
      // Ignore storage access restrictions
    }
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    setNewsletterStatus('');

    if (!trimmed) {
      setNewsletterError('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setNewsletterError('Please enter a valid email address (for example, name@institution.edu).');
      return;
    }

    setNewsletterError('');
    setSubscribedEmail(trimmed);
    setEmail('');
    try {
      window.localStorage.setItem(NEWSLETTER_STORAGE_KEY, trimmed);
    } catch {
      // Ignore storage access restrictions
    }
    setNewsletterStatus(
      `Subscribed ${trimmed} for TokCred protocol releases and security advisories (saved in this browser).`
    );
  };

  const handleUnsubscribe = () => {
    const previous = subscribedEmail;
    setSubscribedEmail('');
    setNewsletterError('');
    try {
      window.localStorage.removeItem(NEWSLETTER_STORAGE_KEY);
    } catch {
      // Ignore storage access restrictions
    }
    setNewsletterStatus(
      previous
        ? `Unsubscribed ${previous}. Your email preference has been cleared from this browser.`
        : 'You have been unsubscribed from TokCred updates.'
    );
  };

  if (isHomePage) {
    return (
      <footer className="w-full bg-[#B3A4F8] p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1440px] mx-auto bg-white rounded-[32px] md:rounded-[40px] flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-10 pb-8 sm:pb-10 lg:pb-12 relative">
          
          {/* TOP AREA — mascot left, email box right */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 w-full">
            {/* Left: Mascot */}
            <div className="flex-shrink-0 pt-2">
              <img src="/mascot2.gif" alt="TokCred Mascot" className="w-[56px] lg:w-[64px] object-contain" />
            </div>

            {/* Right: Newsletter box */}
            <div className="flex-1 lg:ml-24 bg-[#F8F8FA] rounded-[28px] lg:rounded-[32px] p-6 md:p-8 lg:p-8 flex flex-col justify-between gap-4 relative min-h-[160px]">
              {subscribedEmail ? (
                <div className="flex flex-col justify-between gap-4 h-full">
                  <div>
                    <div
                      role="status"
                      className="inline-flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-[14px] px-4 py-3 text-[14px] font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-none mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          Subscribed: <span className="break-all">{subscribedEmail}</span>
                        </p>
                        <p className="text-[13px] text-emerald-800 mt-1">
                          {newsletterStatus ||
                            'You will receive TokCred protocol releases, security advisories, and verification updates (stored locally in this browser).'}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#5B5374] text-[13px] mt-3 max-w-[560px]">
                      We only share major contract updates, security notices, and institutional onboarding tools — never spam or third-party marketing. Click Unsubscribe below at any time to opt out and clear your address.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleUnsubscribe}
                      className="bg-white border border-[#D7CFEC] hover:bg-[#EAE4FF] text-[#34285a] px-6 py-2.5 rounded-full font-semibold text-[14px] transition-colors"
                    >
                      Unsubscribe
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} noValidate className="flex flex-col justify-between gap-4 h-full">
                  <div>
                    <label htmlFor="tokcred-newsletter-email" className="sr-only">
                      Email address for TokCred updates
                    </label>
                    <input
                      id="tokcred-newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (newsletterError) setNewsletterError('');
                      }}
                      placeholder="Enter your email"
                      aria-invalid={Boolean(newsletterError)}
                      aria-describedby={newsletterError ? 'tokcred-newsletter-error' : 'tokcred-newsletter-help'}
                      className="w-full bg-transparent text-[#34285a] placeholder-[#9B93B4] text-[28px] sm:text-[36px] md:text-[44px] lg:text-[48px] font-[500] tracking-[-0.02em] leading-[1.1] outline-none border-none"
                    />
                    {newsletterError && (
                      <div
                        id="tokcred-newsletter-error"
                        role="alert"
                        className="mt-3 inline-flex items-center gap-2 text-[14px] font-medium text-[#B91C1C] bg-red-50 border border-red-200 rounded-[12px] px-3.5 py-2"
                      >
                        <AlertCircle className="w-4 h-4 flex-none" />
                        <span>{newsletterError}</span>
                      </div>
                    )}
                    {newsletterStatus && !newsletterError && (
                      <div
                        role="status"
                        className="mt-3 inline-flex items-center gap-2 text-[14px] font-medium text-[#34285a] bg-[#EAE4FF] border border-[#D4C8FB] rounded-[12px] px-3.5 py-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#5B21B6] flex-none" />
                        <span>{newsletterStatus}</span>
                      </div>
                    )}
                    <p id="tokcred-newsletter-help" className="text-[#34285a] text-[15px] md:text-[16px] font-[600] mt-4 max-w-[540px]">
                      Get occasional TokCred protocol updates, security advisories, and verification release notes.
                    </p>
                    <p className="text-[#6E658C] text-[13px] mt-1.5 max-w-[540px]">
                      No spam or marketing — you can unsubscribe anytime in one click right here after signing up.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="self-end bg-[#EAE4FF] hover:bg-[#D5C9FC] text-[#34285a] px-9 py-4 rounded-full font-semibold text-[17px] transition-colors"
                  >
                    Sign up
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* BOTTOM AREA — operational left, links right */}
          <div className="flex flex-col-reverse lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-10 mt-auto pt-6 w-full">
            {/* Left Bottom: Operational pill */}
            <div className="flex items-center gap-2.5 bg-[#F8F8FA] text-[#34285a] px-5 py-2.5 rounded-full text-[13px] font-semibold">
              <div className="w-[8px] h-[8px] rounded-full bg-[#34D97B]"></div>
              Operational
            </div>

            {/* Right Bottom: Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-14 lg:gap-x-20 gap-y-10 text-left">
              <div className="flex flex-col gap-3.5">
                <h4 className="text-[#9B93B4] text-[14px] font-semibold mb-1">Product</h4>
                <Link to="/features" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Features</Link>
                <Link to="/public-verify" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Public Verify</Link>
                <Link to="/institutions" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">For Institutions</Link>
                <Link to="/support" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Support</Link>
              </div>
              <div className="flex flex-col gap-3.5">
                <h4 className="text-[#9B93B4] text-[14px] font-semibold mb-1">Resources</h4>
                <Link to="/developers" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Docs</Link>
                <Link to="/privacy" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Privacy</Link>
                <Link to="/terms" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Terms</Link>
              </div>
              <div className="flex flex-col gap-3.5">
                <h4 className="text-[#9B93B4] text-[14px] font-semibold mb-1">Open Source</h4>
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity"
                >
                  GitHub Repo
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`${GITHUB_REPO_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity"
                >
                  Report an Issue
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar — on purple, below the white card */}
        <div className="w-full max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center px-8 py-6 text-white/70 text-[14px] font-medium">
          <div>© TokCred {new Date().getFullYear()}</div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    );
  }

  // Elegant Minimal Silver Footer for all other pages (matching Image 2)
  return (
    <footer className="w-full py-8 border-t border-white/40 flex flex-col sm:flex-row items-center justify-between px-8 max-w-[1312px] mx-auto text-[#756F80] text-[12px] gap-4 relative z-10 font-['Inter']">
      <div>© {new Date().getFullYear()} TokCred Protocol. All rights reserved.</div>
      <div className="flex flex-wrap justify-center items-center gap-6">
        <Link to="/" className="hover:text-[#292333] transition-colors">Home</Link>
        <Link to="/features" className="hover:text-[#292333] transition-colors">Features</Link>
        <Link to="/institutions" className="hover:text-[#292333] transition-colors">For Institutions</Link>
        <Link to="/public-verify" className="hover:text-[#292333] transition-colors">Public Verify</Link>
        <Link to="/developers" className="hover:text-[#292333] transition-colors">Docs</Link>
        <Link to="/support" className="hover:text-[#292333] transition-colors">Support</Link>
        <Link to="/privacy" className="hover:text-[#292333] transition-colors">Privacy</Link>
        <Link to="/terms" className="hover:text-[#292333] transition-colors">Terms</Link>
        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#292333] transition-colors">GitHub</a>
      </div>
    </footer>
  );
};

export default Footer;
