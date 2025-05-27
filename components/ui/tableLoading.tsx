const TableLoading = () => {
  return (
    <div className="absolute inset-0 z-50 bg-pageColor/50 dark:bg-zinc-800/70 flex items-center justify-center transition-opacity duration-300">
      <div className="w-16 h-16 border-4 border-white border-t-primary rounded-full animate-spin" />
    </div>
  );
};

export default TableLoading;
