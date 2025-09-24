"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { useMotion } from "@/contexts/MotionContext";

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function SuccessToast({
  message,
  isVisible,
  onClose,
  duration = 3000,
}: SuccessToastProps) {
  const { prefersReducedMotion } = useMotion();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg border border-green-400/20 backdrop-blur-sm ${
        prefersReducedMotion
          ? "opacity-100"
          : "animate-in slide-in-from-right-full duration-300"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 hover:bg-green-600/20 rounded p-1 transition-colors duration-150"
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
