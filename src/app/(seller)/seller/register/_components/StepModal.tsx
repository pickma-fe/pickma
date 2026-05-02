'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XIcon } from 'lucide-react';

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function StepModal({
  isOpen,
  onClose,
  title,
  children,
}: StepModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
          {/* 헤더 - 고정 */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
            <DialogTitle className="text-base font-semibold text-gray-900">
              {title}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 컨텐츠 - 스크롤 가능 */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
