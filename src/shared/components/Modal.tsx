import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = 'md',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`w-full ${maxWidths[maxWidth]} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
