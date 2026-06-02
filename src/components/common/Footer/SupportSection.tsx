import { MailIcon, MessageCircleMoreIcon, PhoneCall } from 'lucide-react';

export function SupportSection() {
  return (
    <section aria-label="고객센터 정보">
      <h3 className="mb-6 font-semibold">고객센터</h3>

      <address className="text-xs font-medium text-gray-600 not-italic">
        <div className="space-y-4">
          <a
            href="tel:15880000"
            className="text-primary-600 flex items-center gap-3 text-base font-semibold lg:gap-2"
          >
            <PhoneCall size={20} />
            1588-0000
          </a>
          <p>평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
        </div>
        <div className="mt-2 space-y-6 border-t border-transparent pt-2 lg:mt-4 lg:space-y-4 lg:border-gray-200 lg:pt-4">
          <a
            href="mailto:support@pickma.kr"
            className="flex items-center gap-2"
          >
            <MailIcon size={16} />
            support@pickma.kr
          </a>
          <p className="flex items-center gap-2">
            <MessageCircleMoreIcon size={16} />
            {/* TODO: 기능 결정 후 Link(페이지) 또는 button(모달)으로 교체 */}
            <span>1:1 문의하기</span>
          </p>
        </div>
      </address>
    </section>
  );
}
