import { Footer } from '@/components/common';
import { ConsumerHeaderShell } from '@/components/consumer/ConsumerHeaderShell';

export default function ConsumerShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ConsumerHeaderShell />
      {children}
      <Footer />
    </div>
  );
}
