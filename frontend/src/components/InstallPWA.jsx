import { useEffect, useState } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  if (!deferredPrompt) return null;

  return (
    <button
      className="rounded-md border border-[#8197ff]/40 bg-[#8197ff]/10 px-3 py-2 text-xs text-[#8197ff]"
      onClick={async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
      }}
      type="button"
    >
      Install App
    </button>
  );
};

export default InstallPWA;
