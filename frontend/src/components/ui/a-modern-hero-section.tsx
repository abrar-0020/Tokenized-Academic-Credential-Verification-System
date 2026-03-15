import React from 'react';

interface HeroSectionProps {
  account?: string | null;
  onConnect?: () => void;
}

export default function HeroSection({ account, onConnect }: HeroSectionProps) {
  return (
    <section className="bg-gray-100 py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Decorative elements - hidden on mobile for cleaner look */}
      <div className="hidden sm:block absolute top-20 right-20 w-3 h-3 sm:w-4 sm:h-4 bg-sky-400 rounded-full"></div>
      <div className="hidden sm:block absolute top-32 right-32 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-sm transform rotate-45"></div>
      <div className="hidden sm:block absolute top-40 right-16 w-1 h-6 sm:w-2 sm:h-8 bg-blue-500"></div>
      <div className="hidden sm:block absolute top-48 right-24 w-4 h-1 sm:w-6 sm:h-2 bg-sky-400"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
              Powered by Blockchain Technology
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              Tokenized Academic
              <br className="hidden sm:block" />
              <span className="block sm:inline text-sky-600"> Credentials</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Secure, verifiable, and permanent academic credentials on the blockchain. No forgeries. No middlemen.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {!account ? (
                <button
                  onClick={onConnect}
                  className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-sky-500/30 transition-all text-sm w-full sm:w-auto"
                >
                  Connect Wallet
                </button>
              ) : (
                <a
                  href="/dashboard"
                  className="inline-block text-center bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-sky-500/30 transition-all text-sm w-full sm:w-auto"
                >
                  Go to Dashboard →
                </a>
              )}
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            {/* Blockchain Dashboard Card */}
            <div className="relative bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl transform rotate-6 sm:rotate-12 hover:rotate-0 transition-transform duration-300 max-w-sm mx-auto lg:max-w-none">
              <div className="text-white mb-3 sm:mb-4">
                <div className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Sepolia Network</div>
                <div className="text-xs text-sky-400 font-semibold">Smart Contract</div>
              </div>

              {/* Pixelated pattern - responsive grid */}
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {Array.from({ length: 48 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 sm:w-3 sm:h-3 ${
                      Math.random() > 0.7
                        ? Math.random() > 0.5
                          ? "bg-sky-500"
                          : Math.random() > 0.5
                            ? "bg-emerald-400"
                            : "bg-blue-500"
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center text-white text-xs sm:text-sm">
                <div>
                  <div className="mb-1">Contract: ERC-721</div>
                  <div className="text-slate-400 text-xs">Status: Active</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-emerald-400">Verified</div>
                  <div className="text-slate-400 text-xs">Block Time: ~12s</div>
                </div>
              </div>
            </div>

            {/* Floating decorative elements - smaller on mobile */}
            <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 w-6 h-6 sm:w-8 sm:h-8 bg-sky-400 rounded-lg transform rotate-45"></div>
            <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full"></div>
            <div className="hidden sm:block absolute top-1/2 -right-8 w-4 h-12 bg-sky-500"></div>

            {/* Scattered pixels - hidden on mobile */}
            <div className="hidden sm:block absolute top-8 right-8 w-2 h-2 bg-sky-400"></div>
            <div className="hidden sm:block absolute bottom-12 left-8 w-3 h-3 bg-blue-400 rounded-full"></div>
            <div className="hidden sm:block absolute top-16 left-12 w-2 h-6 bg-sky-500"></div>
          </div>
        </div>

        {/* Trust indicators - responsive layout */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12 opacity-60">
            {["Ethereum", "Sepolia Testnet", "Hardhat", "Vite", "Solidity"].map((company, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-slate-400 rounded"></div>
                <span className="text-slate-600 font-medium text-sm sm:text-base">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
