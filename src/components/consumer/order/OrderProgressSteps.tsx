import { Check, CreditCard, MapPin, ShoppingCart } from 'lucide-react';

const ORDER_STEPS = [
  { label: '장바구니', icon: ShoppingCart, active: true },
  { label: '주문 정보', icon: MapPin, active: false },
  { label: '결제 수단', icon: CreditCard, active: false },
  { label: '결제 완료', icon: Check, active: false },
];

export function OrderProgressSteps() {
  return (
    <ol className="grid grid-cols-4 items-start gap-3">
      {ORDER_STEPS.map((step, index) => {
        const Icon = step.icon;

        return (
          <li key={step.label} className="relative flex flex-col items-center">
            <span className="absolute top-5 right-1/2 left-0 h-px bg-gray-200" />
            {index < ORDER_STEPS.length - 1 ? (
              <span className="absolute top-5 right-0 left-1/2 h-px bg-gray-200" />
            ) : null}
            <span
              className={[
                'relative z-10 flex size-11 items-center justify-center rounded-full border bg-white',
                step.active
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-200 text-gray-600',
              ].join(' ')}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span
              className={[
                'mt-3 text-sm font-semibold',
                step.active ? 'text-primary-500' : 'text-gray-600',
              ].join(' ')}
            >
              {index + 1}. {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
