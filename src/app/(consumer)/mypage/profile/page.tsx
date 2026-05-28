import { Footer } from '@/components/common';
import { ConsumerHeader } from '@/components/consumer/ConsumerHeader';
import {
  MypageSidebar,
  ProfileEditPageContent,
} from '@/components/consumer/mypage';

export default function MypageProfilePage() {
  return (
    <div className="bg-white">
      <ConsumerHeader />

      <main className="min-h-screen bg-white">
        <div className="mx-auto grid max-w-450 grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)]">
          <MypageSidebar />

          <section className="px-5 py-10 lg:px-10">
            <ProfileEditPageContent />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
