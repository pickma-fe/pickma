import type { Toast as ToastItem } from '@/stores/useToastStore';

interface ToastProps {
  toast: ToastItem;
  onClose: () => void;
}

const typeStyles: Record<ToastItem['type'], string> = {
  success: 'bg-primary-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-gray-700 text-white',
};

export function Toast({ toast, onClose }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex min-w-64 items-start gap-3 rounded-md px-4 py-3 shadow-lg ${typeStyles[toast.type]}`}
    >
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        aria-label="알림 닫기"
      >
        ✕
      </button>
    </div>
  );
}
