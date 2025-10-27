import { Button } from "@/components/ui/button";
import { useFloatingButtonPosition } from "@/shared/hooks/useFloatingButtonPosition";
import { ReactNode } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Example component demonstrating proper floating button positioning
 *
 * This component automatically positions itself above the navbar,
 * accounting for navbar visibility and safe area insets.
 *
 * Usage:
 * <FloatingActionButton onClick={() => navigate("/create")}>
 *   <PlusIcon />
 *   Create New
 * </FloatingActionButton>
 */
export function FloatingActionButton({
  onClick,
  children,
  className = "",
  disabled = false,
}: FloatingActionButtonProps) {
  const buttonPosition = useFloatingButtonPosition();

  return (
    <Button
      className={`fixed right-2 text-sm ${className}`}
      style={buttonPosition}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
