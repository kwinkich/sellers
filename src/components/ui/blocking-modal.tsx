import * as React from "react";
import { cn } from "@/lib/utils";

interface BlockingModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const BlockingModal: React.FC<BlockingModalProps> = ({
  open,
  title,
  description,
  onClose,
  className,
  children,
}) => {
  if (!open) return null;
  return (
    <div className={cn("fixed inset-0 z-[1000]", className)}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white text-black shadow-xl">
          <div className="p-4">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};


