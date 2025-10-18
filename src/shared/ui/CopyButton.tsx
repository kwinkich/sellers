import { CopyIcon } from "@/shared/icons/copy-icon";
import { SuccessIcon } from "@/shared/icons/success-icon";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: number;
  disabled?: boolean;
  title?: string;
  successTitle?: string;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      text,
      className,
      size = 16,
      disabled = false,
      title = "Скопировать",
      successTitle = "Скопировано!",
    },
    ref
  ) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard();

    const handleClick = async () => {
      if (disabled || !text) return;

      try {
        await copyToClipboard(text);
      } catch (error) {
        console.error("Copy failed:", error);
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          "transition-all duration-200 ease-in-out",
          "hover:scale-105 active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        disabled={disabled || !text}
        title={isCopied ? successTitle : title}
      >
        <div
          className={cn(
            "relative w-full h-full flex items-center justify-center",
            "transition-all duration-300",
            isCopied && "animate-in zoom-in-50"
          )}
        >
          {isCopied ? (
            <SuccessIcon size={size} fill="#10B981" />
          ) : (
            <CopyIcon size={size} fill="#06935F" />
          )}
        </div>
      </button>
    );
  }
);

CopyButton.displayName = "CopyButton";
