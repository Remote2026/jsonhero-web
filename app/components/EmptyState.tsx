export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-5xl mb-4 opacity-60">🔍</div>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
        No document open
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Open a JSON file to get started
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Ctrl+N</kbd> to create a new document
      </p>
    </div>
  );
}
