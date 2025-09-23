export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center bg-neutral-800">
      <div className="relative w-full max-w-lg bg-background shadow-2xl flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
