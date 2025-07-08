import { ReactNode, useEffect, useRef, useCallback } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Modal({ open, onClose, children, className = "", title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) { return; }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [ open, onClose ]);

  // Cerrar al hacer clic fuera
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) { onClose(); }
  }, [ onClose ]);

  if (!open) { return null; }

  return (
    <div
      ref={overlayRef}
      className={
        `fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in-0 zoom-in-95 ${className}`
      }
      onClick={handleOverlayClick}
    >
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 transition-all duration-300 animate-in fade-in-0 zoom-in-95" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="px-6 pt-6 pb-2 text-lg font-semibold text-foreground">{title}</div>
        )}
        {children}
      </div>
    </div>
  );
} 