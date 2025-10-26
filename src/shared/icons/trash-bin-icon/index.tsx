import type { FC } from "react";
import type { Icon } from "../types/icon.types";

export const TrashBinIcon: FC<Icon> = ({
  fill = "currentColor",
  size = 18,
  cn = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      className={cn}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
    <path
        stroke={fill} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
  </svg>
  );
};

