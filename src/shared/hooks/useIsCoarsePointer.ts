import { useState, useEffect } from "react";

export function useIsCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(pointer: coarse)");
    setIsCoarse(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsCoarse(e.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isCoarse;
}
