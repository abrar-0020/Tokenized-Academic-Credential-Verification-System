import { Loader3 } from './ui/loader-3';

const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-[#c6c6c7]">
      <Loader3 />
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default Loading;
