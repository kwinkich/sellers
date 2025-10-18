import { useState } from "react";

interface UseCopyToClipboardReturn {
  isCopied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

/**
 * Hook for copying text to clipboard with animation feedback
 * Works on both desktop and mobile devices
 */
export const useCopyToClipboard = (): UseCopyToClipboardReturn => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      // Modern clipboard API (works on most modern browsers and mobile)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed:", err);
          throw new Error("Copy failed");
        } finally {
          document.body.removeChild(textArea);
        }
      }

      // Show success animation
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // You could add a toast notification here if needed
      throw error;
    }
  };

  return {
    isCopied,
    copyToClipboard,
  };
};
