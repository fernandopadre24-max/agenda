export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-lg bg-background shadow-2xl min-h-screen flex flex-col sm:overflow-hidden sm:my-4 sm:rounded-lg">
        {children}
      </div>
    </div>
  );
}
