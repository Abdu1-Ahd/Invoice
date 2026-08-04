import React from 'react';
import { Typography } from './Typography';
import { Button } from './Button';
import { AlertCircle, X } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  title = 'Attention Required',
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-2xl max-w-md w-full relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-danger/15 text-danger flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 min-w-0 flex-1 pr-4">
            <Typography variant="h3" className="text-lg font-bold text-text-primary">
              {title}
            </Typography>
            <Typography variant="body" className="text-sm text-text-secondary leading-relaxed">
              {message}
            </Typography>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose} className="w-full sm:w-auto px-6">
            Understand & Close
          </Button>
        </div>
      </div>
    </div>
  );
};
