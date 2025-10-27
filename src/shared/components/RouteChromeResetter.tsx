import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUiChrome } from "@/shared";

export function RouteChromeResetter() {
  const { pathname } = useLocation();
  const reset = useUiChrome((s) => s.reset);

  useEffect(() => {
    reset(); // drop any stray locks on route change
  }, [pathname, reset]);

  return null;
}
