import React, { useState } from 'react';
import { QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function GetAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-slate-800 text-white rounded-full p-4 shadow-xl hover:bg-slate-700 transition-all duration-300 flex items-center gap-2 z-50 group hover:pr-6 hover:shadow-2xl"
      >
        <QrCode size={24} />
        <span className="font-semibold overflow-hidden w-0 opacity-0 group-hover:w-16 group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap">Get App</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Get the TokCred App</h2>
            <p className="text-gray-500 text-center mb-8 text-sm">
              Point your phone camera at the QR code to open the app store instantly.
            </p>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-center mb-8">
              <QRCodeSVG 
                value="https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System/releases/download/v1.0.0/app-debug.apk" 
                size={200}
                level="H"
              />
            </div>

            <div className="text-center text-sm text-gray-400 mb-4">
              Scan with your phone camera
            </div>

          </div>
        </div>
      )}
    </>
  );
}
