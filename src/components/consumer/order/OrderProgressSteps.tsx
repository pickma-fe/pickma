import { Check, CreditCard, MapPin, ShoppingCart } from 'lucide-react';

const ORDER_STEPS = [
  { id: 'cart', label: '장바구니', icon: ShoppingCart },
  { id: 'order', label: '주문 정보', icon: MapPin },
  { id: 'payment', label: '결제 수단', icon: CreditCard },
  { id: 'complete', label: '결제 완료', icon: Check },
] as const;

const PROGRESS_WIDTH_CLASS_NAMES = {
  cart: 'w-0',
  order: 'w-[25%]',
  payment: 'w-[50%]',
  complete: 'w-[75%]',
} satisfies Record<OrderStepId, string>;

export type OrderStepId = (typeof ORDER_STEPS)[number]['id'];

interface OrderProgressStepsProps {
  currentStep?: OrderStepId;
}

export function OrderProgressSteps({
  currentStep = 'cart',
}: OrderProgressStepsProps) {
  const currentStepIndex = ORDER_STEPS.findIndex(
    (step) => step.id === currentStep
  );

  return (
    <div className="relative">
      <span
        className="absolute top-5 right-[12.5%] left-[12.5%] h-px bg-gray-200"
        aria-hidden="true"
      />
      <span
        className={[
          'bg-primary-500 absolute top-5 left-[12.5%] h-px',
          PROGRESS_WIDTH_CLASS_NAMES[currentStep],
        ].join(' ')}
        aria-hidden="true"
      />
      <ol aria-label="주문 진행 단계" className="relative grid grid-cols-4">
        {ORDER_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          let iconStateClassName = 'border-gray-200 bg-white text-gray-600';
          let labelStateClassName = 'text-gray-600';

          if (isActive) {
            iconStateClassName = 'border-primary-500 bg-primary-500 text-white';
            labelStateClassName = 'text-primary-500';
          } else if (isCompleted) {
            iconStateClassName = 'border-primary-500 bg-white text-primary-500';
            labelStateClassName = 'text-gray-900';
          }

          return (
            <li
              key={step.id}
              aria-current={isActive ? 'step' : undefined}
              className="relative flex min-w-0 flex-col items-center"
            >
              <span
                className={[
                  'relative z-10 flex size-10 items-center justify-center rounded-full border sm:size-11',
                  iconStateClassName,
                ].join(' ')}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span
                className={[
                  'mt-3 text-center text-xs leading-4 font-semibold break-keep sm:text-sm',
                  labelStateClassName,
                ].join(' ')}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
