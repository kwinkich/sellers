import { useMemo } from "react";
import { useUiChrome } from "@/shared";

/**
 * Hook for positioning floating buttons above the navbar
 *
 * This hook provides proper positioning styles that account for:
 * - Navbar height (using CSS variable --nav-h)
 * - Safe area insets
 * - Navbar visibility state
 *
 * Usage:
 * const buttonStyles = useFloatingButtonPosition();
 * <Button style={buttonStyles} className="fixed right-2">...</Button>
 */
export function useFloatingButtonPosition() {
  const isNavHidden = useUiChrome((s) => s.isNavHidden);

  return useMemo(() => {
    const navHeight = "var(--nav-h, 80px)";
    const safeAreaBottom = "env(safe-area-inset-bottom, 0px)";

    // Calculate total space needed for navbar + safe area
    const totalNavSpace = `calc(${navHeight} + ${safeAreaBottom})`;

    // Add some padding above the navbar
    const paddingAbove = "16px"; // 1rem

    return {
      bottom: isNavHidden
        ? safeAreaBottom // When navbar is hidden, just account for safe area
        : `calc(${totalNavSpace} + ${paddingAbove})`, // When visible, account for navbar + safe area + padding
      transition: "bottom 0.16s ease-out", // Smooth transition when navbar shows/hides
    };
  }, [isNavHidden]);
}
