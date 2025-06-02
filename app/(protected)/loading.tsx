const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-screen min-h-screen h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center font-sans overflow-hidden z-[9999]">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-30 animate-pulse bg-gradient-radial from-purple-500/10 to-transparent"></div>

      {/* Content Wrapper */}
      <div className="flex flex-col items-center gap-8 z-10 relative">
        {/* Loading Text */}
        <div className="text-white text-lg font-light tracking-[3px] uppercase opacity-80 animate-pulse">
          Loading
        </div>

        {/* Subtitle */}
        <div className="text-white/60 text-xs font-light tracking-wider">
          Please wait...
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div className="h-full w-full bg-gradient-to-r from-purple-500 via-cyan-500 via-green-500 via-yellow-500 to-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
