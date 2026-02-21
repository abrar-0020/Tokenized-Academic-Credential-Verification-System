const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: 'bg-emerald-50 border-emerald-400 text-emerald-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-amber-50 border-amber-400 text-amber-800',
    info: 'bg-sky-50 border-sky-400 text-sky-800',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`border-l-4 p-4 ${types[type]} rounded-xl mb-4`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          <span className="text-base font-bold mt-0.5">{icons[type]}</span>
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 ml-4 flex-shrink-0 font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;

