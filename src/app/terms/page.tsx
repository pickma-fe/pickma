import type { Metadata } from 'next';

import { Footer } from '@/components/common/Footer/Footer';
import { ConsumerHeader } from '@/components/consumer/ConsumerHeader';

export const metadata: Metadata = {
  title: '이용약관 | PickMa',
  description: 'PickMa 이용약관',
};

const termsSections = [
  {
    id: 'section-1',
    title: '제1조 목적',
    content:
      '이 약관은 PickMa가 제공하는 마감상품 예약·픽업 플랫폼 및 관련 서비스의 이용 조건, 절차, 회원과 PickMa의 권리·의무 및 책임사항을 정하는 것을 목적으로 합니다.',
  },
  {
    id: 'section-2',
    title: '제2조 용어의 정의',
    content:
      '“서비스”란 PickMa가 제공하는 상품 탐색, 예약, 결제, 픽업, 판매자 관리, 관리자 운영 기능을 의미합니다. “회원”이란 이 약관에 동의하고 서비스를 이용하는 자를 말합니다. “소비자”란 상품을 조회, 예약, 결제하고 픽업하는 회원을 말하며, “판매자”란 상품과 가게 정보를 등록하고 주문을 처리하는 회원을 말합니다. “상품”이란 판매자가 PickMa를 통해 예약·픽업 방식으로 판매하는 재화 또는 서비스를 의미합니다.',
  },
  {
    id: 'section-3',
    title: '제3조 약관의 효력 및 변경',
    content:
      '이 약관은 회원이 동의함으로써 효력이 발생합니다. PickMa는 관계 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자와 변경 사유를 서비스 화면 또는 공지사항을 통해 안내합니다. 회원에게 불리한 변경의 경우 합리적인 기간을 두고 사전에 고지합니다.',
  },
  {
    id: 'section-4',
    title: '제4조 회원 가입 및 계정 관리',
    content:
      '회원은 정확한 정보를 제공하여 가입해야 하며, 계정과 비밀번호 관리 책임은 회원에게 있습니다. 타인의 정보를 도용하거나 허위 정보를 입력한 경우 PickMa는 서비스 이용을 제한하거나 회원 자격을 해지할 수 있습니다. 회원은 계정 정보가 도용되었거나 제3자가 사용하고 있음을 알게 된 경우 즉시 PickMa에 알려야 합니다.',
  },
  {
    id: 'section-5',
    title: '제5조 서비스의 제공',
    content:
      'PickMa는 소비자에게 상품 목록, 검색, 상세 조회, 예약, 결제, 주문 내역 확인 기능을 제공하고, 판매자에게 상품, 주문, 가게 정보 관리 기능을 제공합니다. 서비스는 연중무휴 1일 24시간 제공함을 원칙으로 하나, 시스템 점검, 장애, 운영상 필요가 있는 경우 일시 중단될 수 있습니다.',
  },
  {
    id: 'section-6',
    title: '제6조 예약, 결제 및 픽업',
    content:
      '소비자는 상품명, 가격, 할인율, 픽업 가능 시간, 수량, 판매자 정보를 확인한 후 예약 및 결제를 진행해야 합니다. 예약은 결제 또는 주문 생성이 완료된 때 성립하며, 상품 재고, 픽업 시간, 판매자 승인 상태 등에 따라 취소될 수 있습니다. 소비자는 지정된 픽업 시간 내에 상품을 수령해야 하며, 미수령 또는 지연 수령으로 발생하는 불이익은 회원에게 귀속될 수 있습니다.',
  },
  {
    id: 'section-7',
    title: '제7조 취소 및 환불',
    content:
      '예약 취소, 결제 취소 및 환불은 상품 상태, 픽업 시간, 판매자 처리 상태, 결제수단 정책에 따라 처리됩니다. 상품 특성상 픽업 가능 시간이 임박했거나 판매자가 주문을 준비한 이후에는 취소가 제한될 수 있습니다. 결제 취소와 환불은 결제대행사 및 관계 법령에서 정한 절차에 따라 처리됩니다.',
  },
  {
    id: 'section-8',
    title: '제8조 판매자의 의무',
    content:
      '판매자는 실제 판매 가능한 상품, 가격, 재고, 픽업 시간, 가게 정보를 정확하게 등록해야 합니다. 판매자는 주문 처리, 픽업 응대, 상품 품질 관리, 표시·광고 내용에 대해 책임을 부담하며, 관련 법령과 PickMa 운영 기준을 준수해야 합니다. 허위 정보 등록, 반복적인 주문 취소, 부적절한 고객 응대가 확인되는 경우 PickMa는 판매자 기능 이용을 제한할 수 있습니다.',
  },
  {
    id: 'section-9',
    title: '제9조 회원의 금지 행위',
    content:
      '회원은 타인의 정보 도용, 허위 정보 입력, 부정 결제, 서비스 장애 유발, 무단 크롤링, PickMa 또는 제3자의 권리 침해, 법령 또는 공서양속에 반하는 행위를 해서는 안 됩니다. PickMa는 금지 행위가 확인되는 경우 서비스 이용 제한, 주문 취소, 회원 자격 정지 또는 해지 등 필요한 조치를 취할 수 있습니다.',
  },
  {
    id: 'section-10',
    title: '제10조 개인정보 보호',
    content:
      'PickMa는 개인정보보호법 등 관계 법령을 준수하며, 회원의 개인정보 처리 기준은 별도의 개인정보처리방침에서 정합니다. 회원은 서비스 이용 과정에서 개인정보 수집·이용 동의, 선택 동의, 동의 철회 등에 관한 권리를 행사할 수 있습니다.',
  },
  {
    id: 'section-11',
    title: '제11조 지식재산권',
    content:
      '서비스 화면, 로고, 디자인, 텍스트, 소프트웨어 등 PickMa가 제작한 콘텐츠에 대한 권리는 PickMa에 귀속됩니다. 회원이 서비스에 등록한 상품 정보, 이미지, 리뷰 등 콘텐츠에 대한 권리와 책임은 해당 회원에게 있으며, 회원은 서비스 운영과 홍보에 필요한 범위에서 PickMa가 이를 사용할 수 있도록 허락합니다.',
  },
  {
    id: 'section-12',
    title: '제12조 책임의 제한',
    content:
      'PickMa는 천재지변, 네트워크 장애, 외부 서비스 장애, 회원의 귀책 사유 등 PickMa가 통제하기 어려운 사유로 발생한 손해에 대해 책임을 부담하지 않습니다. 판매자가 등록한 상품 정보, 상품 품질, 픽업 응대와 관련한 책임은 원칙적으로 해당 판매자에게 있습니다. 다만 PickMa의 고의 또는 중대한 과실이 있는 경우에는 관계 법령에 따라 책임을 부담합니다.',
  },
  {
    id: 'section-13',
    title: '제13조 분쟁 처리 및 준거법',
    content:
      'PickMa와 회원 사이에 분쟁이 발생한 경우 양 당사자는 성실히 협의하여 해결합니다. 협의로 해결되지 않는 분쟁에는 대한민국 법령을 적용하며, 관할 법원은 민사소송법 등 관계 법령에 따릅니다.',
  },
  {
    id: 'section-annex',
    title: '부칙',
    content: '이 약관은 2026년 6월 2일부터 시행합니다.',
  },
];

export default function TermsPage() {
  return (
    <>
      <ConsumerHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-primary-600 text-sm font-semibold">PickMa Legal</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">이용약관</h1>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            본 약관은 PickMa 서비스 이용과 관련하여 회원과 PickMa 사이의 권리,
            의무 및 책임사항을 정합니다.
          </p>
          <p className="mt-2 text-sm text-gray-500">시행일: 2026년 6월 2일</p>
        </div>

        <nav
          id="toc"
          aria-label="목차"
          className="mb-10 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4"
        >
          <p className="mb-3 text-sm font-semibold text-gray-700">목차</p>
          <ol className="space-y-1.5">
            {termsSections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="rounded text-base text-gray-600 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 focus-visible:outline-none"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-8">
          {termsSections.map((section) => (
            <section key={section.id} className="space-y-3">
              <h2
                id={section.id}
                className="text-lg font-semibold text-gray-900"
              >
                <a
                  href="#toc"
                  className="hover:text-primary-600 rounded focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 focus-visible:outline-none"
                >
                  {section.title}
                </a>
              </h2>
              <p className="text-base leading-7 text-gray-600">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
