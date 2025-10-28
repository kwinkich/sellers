import { X } from "lucide-react";

interface HeaderWithCloseProps {
  title: string;
  description?: string;
  onClose: () => void;
  className?: string;
  variant?: "light" | "dark";
}

export const HeaderWithClose = ({
  title,
  description,
  onClose,
  className = "",
  variant = "light",
}: HeaderWithCloseProps) => {
  const isDark = variant === "dark";

  return (
    <div className={`flex flex-col gap-1 mb-6 pl-2 ${className}`}>
      {/* Title and close button */}
      <div className="flex items-center justify-between">
        <h1
          className={`text-2xl font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h1>
        <button
          onClick={onClose}
          className={`
            p-2 rounded-full transition-colors
            flex items-center justify-center
            ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}
          `}
          title="Закрыть"
        >
          <X className={`h-5 w-5 ${isDark ? "text-white" : "text-gray-600"}`} />
        </button>
      </div>

      {/* Description */}
      {description && (
        <div className="text-left">
          <p
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            {description}
          </p>
        </div>
      )}
    </div>
  );
};
