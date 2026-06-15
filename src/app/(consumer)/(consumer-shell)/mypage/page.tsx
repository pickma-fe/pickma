import {
  MypageSidebar,
  ProfileEditPageContent,
} from '@/components/consumer/mypage';

export default function MypagePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid max-w-450 grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)]">
        <MypageSidebar activeView="profile" />

        <section className="px-5 py-10 lg:px-10">
          <ProfileEditPageContent />
        </section>
      </div>
    </main>
  );
}
