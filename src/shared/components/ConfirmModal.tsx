import React from 'react';
import { Typography } from './Typography';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, backdropVariants } from '@/shared/config/animations';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-2xl max-w-md w-full relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={onCancel}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
              aria-label="Cancel"
            >
              <X className="w-5 h-5" />
            </motion.button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full flex-shrink-0 ${variant === 'danger' ? 'bg-danger/15 text-danger' : 'bg-accent/15 text-accent'}`}>
            <AlertTriangle className="w-6 h-6" />
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

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} className="w-full sm:w-auto px-6">
            {confirmText}
          </Button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
