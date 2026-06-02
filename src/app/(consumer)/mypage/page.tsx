import { Footer } from '@/components/common';
import { ConsumerHeader } from '@/components/consumer/ConsumerHeader';
import {
  MypageContent,
  MypageSidebar,
  MypageSummaryPanel,
  ProfileEditPageContent,
} from '@/components/consumer/mypage';

interface MypagePageProps {
  searchParams: Promise<{
    view?: string;
  }>;
}

export default async function MypagePage({ searchParams }: MypagePageProps) {
  const { view } = await searchParams;
  const isReservationsView = view === 'reservations';

  return (
    <div className="bg-white">
      <ConsumerHeader />

      <main className="min-h-screen bg-white">
        <div className="mx-auto grid max-w-450 grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)]">
          <MypageSidebar
            activeView={isReservationsView ? 'reservations' : 'profile'}
          />

          <section className="px-5 py-10 lg:px-10">
            {isReservationsView ? (
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <MypageContent />
                <MypageSummaryPanel />
              </div>
            ) : (
              <ProfileEditPageContent />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
