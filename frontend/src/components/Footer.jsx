import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Link as LinkIcon, Database, Shield, Lock, Code, Mail } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
              <div>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-transparent text-[#34285a] placeholder-[#9B93B4] text-[36px] md:text-[48px] lg:text-[56px] font-[500] tracking-[-0.02em] leading-[1] outline-none border-none"
                />
                <p className="text-[#34285a] text-[15px] md:text-[17px] font-[600] mt-4 max-w-[500px]">
                  Sign up for our newsletter and join the growing TokCred community.
                </p>
              </div>
              <button className="self-end bg-[#EAE4FF] hover:bg-[#D5C9FC] text-[#34285a] px-9 py-4 rounded-full font-semibold text-[17px] transition-colors">
                Sign up
              </button>
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
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Download</a>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Security</a>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Support</a>
              </div>
              <div className="flex flex-col gap-3.5">
                <h4 className="text-[#9B93B4] text-[14px] font-semibold mb-1">Resources</h4>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Blog</a>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Docs</a>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">Taxes</a>
              </div>
              <div className="flex flex-col gap-3.5">
                <h4 className="text-[#9B93B4] text-[14px] font-semibold mb-1">Socials</h4>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">𝕏 X.com</a>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">🔗 LinkedIn</a>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">📷 Instagram</a>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">💬 Reddit</a>
                <a href="#" className="text-[#34285a] text-[14px] font-semibold hover:opacity-70 transition-opacity">▶ YouTube</a>
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
      <div className="flex items-center gap-6">
        <Link to="/" className="hover:text-[#292333] transition-colors">Home</Link>
        <Link to="/features" className="hover:text-[#292333] transition-colors">Features</Link>
        <Link to="/public-verify" className="hover:text-[#292333] transition-colors">Public Verify</Link>
        <Link to="/privacy" className="hover:text-[#292333] transition-colors">Privacy</Link>
        <Link to="/terms" className="hover:text-[#292333] transition-colors">Terms</Link>
      </div>
    </footer>
  );
};

export default Footer;
