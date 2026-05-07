'use client';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const handleClose = () => {
    if (closeOnOverlayClick || closeOnEscape) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeOnOverlayClick || closeOnEscape ? handleClose : () => {}}
      className="relative z-50"
    >
      <DialogBackdrop
        className="fixed inset-0 bg-black/30"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !closeOnEscape) {
            e.stopPropagation();
          }
        }}
      >
        <DialogPanel
          className={`relative flex max-h-[85vh] w-full flex-col rounded-lg bg-white shadow-xl ${SIZE_CLASSES[size]}`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
            <DialogTitle className="text-base font-semibold text-gray-900">
              {title}
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
