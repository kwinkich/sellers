import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { type ReactNode } from "react";

interface EditButtonProps {
  onClick: () => void;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "2s";
  variant?: "default" | "ghost" | "link";
  showIcon?: boolean;
  ariaLabel?: string;
}

/**
 * Reusable edit button component with consistent styling
 *
 * Features:
 * - Consistent green color scheme matching app design
 * - Smooth hover and active states
 * - Optional icon and custom content
 * - Flexible sizing and variants
 * - Accessible with proper ARIA labels
 *
 * Usage examples:
 * <EditButton onClick={() => navigate("/edit")} />
 * <EditButton onClick={handleEdit} showIcon={false}>изменить</EditButton>
 * <EditButton onClick={handleEdit} size="sm">Редактировать курс</EditButton>
 */
export function EditButton({
  onClick,
  children = "изменить",
  className = "",
  disabled = false,
  size = "xs",
  variant = "ghost",
  showIcon = true,
  ariaLabel,
}: EditButtonProps) {
  const baseStyles = `
    w-auto h-11 rounded-xl px-4
    bg-base-main/10 text-base-main
    ring-1 ring-inset ring-base-main/20
    hover:bg-base-main/15 hover:ring-base-main/30
    active:bg-base-main/20 active:translate-y-[1px]
    transition-[background,transform,box-shadow] duration-150
    font-medium tracking-tight
    shadow-[inset_0_-1px_0_rgba(255,255,255,0.25)]
  `;

  const iconStyles = showIcon ? "mr-2 opacity-80" : "";

  return (
    <Button
      size={size}
      variant={variant}
      className={`${baseStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || `Редактировать ${children}`}
    >
      {showIcon && <PencilLine className={`h-4 w-4 ${iconStyles}`} />}
      {children}
    </Button>
  );
}
