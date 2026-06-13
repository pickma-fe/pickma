import Link from 'next/link';

type FooterLink = {
  label: string;
  href: string;
};

type FooterNavSection = {
  id: string;
  title: string;
  items: FooterLink[];
};

const footerNavSections: FooterNavSection[] = [
  {
    id: 'service',
    title: '서비스',
    items: [
      { label: '내 예약', href: '/mypage/orders' },
      { label: '주문/픽업 관리', href: '/orders' },
      { label: '찜한 상품', href: '/wishlist' },
      { label: '리뷰 관리', href: '/reviews' },
    ],
  },
  {
    id: 'partner',
    title: '파트너',
    items: [
      { label: '가게 등록', href: '/partner/register' },
      { label: '파트너 가이드', href: '/partner/guide' },
      { label: '정산 안내', href: '/partner/payout' },
      { label: '공지사항', href: '/notice' },
    ],
  },
  {
    id: 'company',
    title: '회사',
    items: [
      { label: '회사 소개', href: '/about' },
      { label: '이용약관', href: '/terms' },
      { label: '개인정보처리방침', href: '/privacy-policy' },
      { label: '위치기반서비스', href: '/location-policy' },
    ],
  },
];

export function FooterGroup() {
  return (
    <div className="grid grid-cols-1 gap-6 py-10 sm:grid-cols-3 lg:col-span-7 lg:px-10 lg:py-0">
      {footerNavSections.map((section) => (
        <nav key={section.id} aria-labelledby={`footer-${section.id}`}>
          <h3 id={`footer-${section.id}`} className="mb-6 font-semibold">
            {section.title}
          </h3>
          <ul className="space-y-6 text-sm font-medium text-gray-500 lg:space-y-2">
            {section.items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
  );
}
