import { Footer } from '@/components/common';
import { ConsumerHeader } from '@/components/consumer/ConsumerHeader';
import {
  MypageContent,
  MypageSidebar,
  MypageSummaryPanel,
} from '@/components/consumer/mypage';

export default function MypagePage() {
  return (
    <div className="bg-white">
      <ConsumerHeader />

      <main className="min-h-screen bg-white">
        <div className="mx-auto grid max-w-450 grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)]">
          <MypageSidebar />

          <section className="px-5 py-10 lg:px-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              <MypageContent />
              <MypageSummaryPanel />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
