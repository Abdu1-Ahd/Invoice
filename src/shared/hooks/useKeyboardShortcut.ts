import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export const useKeyboardShortcut = (combo: KeyCombo, callback: (e: KeyboardEvent) => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;
      const isAlt = event.altKey;

      if (
        event.key.toLowerCase() === combo.key.toLowerCase() &&
        (combo.ctrlOrCmd ? isCmdOrCtrl : !isCmdOrCtrl) &&
        (combo.shift ? isShift : !isShift) &&
        (combo.alt ? isAlt : !isAlt)
      ) {
        // Prevent default browser behavior (e.g., Save Page for CMD+S)
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combo, callback]);
};
