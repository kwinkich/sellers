import { cn } from "@/lib/utils";
import { useId, useEffect, useRef, type ComponentProps, type FC } from "react";

interface TextareaFloatingLabelProps extends ComponentProps<"textarea"> {
  variant?: "dark" | "second" | "default";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

const TextareaFloatingLabel: FC<TextareaFloatingLabelProps> = ({
  variant = "default",
  placeholder = "",
  value = "",
  onChange,
  disabled = false,
  maxLength,
  showCharCount = true,
  className,
  ...props
}) => {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "120px"; // reset to min
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 300;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    onChange?.(e);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "dark":
        return "bg-[#1A1A1A] border-[#333333] text-white placeholder:text-base-gray focus:border-[#06935F]";
      case "second":
        return "bg-[#F8F8F8] border-[#E5E5E5] text-black placeholder:text-base-gray focus:border-[#06935F]";
      default:
        return "bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring";
    }
  };

  const getLabelColorClasses = () => {
    switch (variant) {
      case "dark":
      case "second":
        return "text-base-gray peer-focus:text-base-gray peer-[&:not(:placeholder-shown)]:text-base-gray";
      default:
        return "text-muted-foreground peer-focus:text-foreground peer-[&:not(:placeholder-shown)]:text-foreground";
    }
  };

  return (
    <div className="group relative w-full min-h-[120px]">
      <textarea
        ref={textareaRef}
        id={id}
        placeholder=" " // important: enables :placeholder-shown
        value={value}
        onChange={handleChange}
        onInput={adjustHeight}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          "peer w-full resize-none rounded-2xl border text-sm ring-offset-background transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Layout/padding: reserve space for label so caret never overlaps it
          "px-3 pt-6 pb-2 min-h-[120px] h-[120px]",
          "flex items-start justify-start",
          getVariantClasses(),
          className
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 z-0 px-1 text-sm transition-all duration-200",
          // Default resting position (inside the field)
          "top-3",
          // Float when focused OR when there is content (i.e., not :placeholder-shown)
          "peer-focus:top-1 peer-focus:text-xs peer-focus:font-medium",
          "peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium",
          // Color by variant
          getLabelColorClasses()
        )}
      >
        {placeholder}
      </label>

      {showCharCount && maxLength && (
        <div className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
          Осталось: {maxLength - (value?.length || 0)}
        </div>
      )}
    </div>
  );
};

export default TextareaFloatingLabel;
