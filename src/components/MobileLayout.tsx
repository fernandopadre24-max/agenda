export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center bg-gray-100 dark:bg-gray-900">
      <div className="relative w-full max-w-lg bg-background shadow-2xl flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
