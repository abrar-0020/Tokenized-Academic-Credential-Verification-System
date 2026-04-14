const Loading = ({ message = 'Loading...', text }) => {
  const displayMessage = message || text || 'Loading...';

  return (
    <div className="bg-[#131313] rounded-xl border border-[#484848]/20 p-6 text-[#c6c6c7] shadow-lg shadow-black/20" role="status" aria-busy="true">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-[#252626] animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 rounded-full bg-[#252626] animate-pulse" />
          <div className="h-3 w-2/3 rounded-full bg-[#252626] animate-pulse opacity-80" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-3 w-full rounded-full bg-[#252626] animate-pulse" />
        <div className="h-3 w-5/6 rounded-full bg-[#252626] animate-pulse" />
      </div>
      <p className="mt-4 text-sm text-[#acabaa]">{displayMessage}</p>
    </div>
  );
};

export default Loading;
