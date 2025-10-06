import type { FC } from "react";
import type { Icon } from "../types/icon.types";

export const PracticeNoCaseIcon: FC<Icon> = ({
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
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <path
        d="M6 2.75C5.30964 2.75 4.75 3.30964 4.75 4V20C4.75 20.6904 5.30964 21.25 6 21.25H18C18.6904 21.25 19.25 20.6904 19.25 20V8.5L13.5 2.75H6ZM13.5 3.56L18.44 8.5H13.5V3.56ZM7.5 12.25C7.5 11.8358 7.83579 11.5 8.25 11.5H15.75C16.1642 11.5 16.5 11.8358 16.5 12.25C16.5 12.6642 16.1642 13 15.75 13H8.25C7.83579 13 7.5 12.6642 7.5 12.25ZM8.25 15.5C7.83579 15.5 7.5 15.8358 7.5 16.25C7.5 16.6642 7.83579 17 8.25 17H12.75C13.1642 17 13.5 16.6642 13.5 16.25C13.5 15.8358 13.1642 15.5 12.75 15.5H8.25Z"
        fill={fill}
      />
    </svg>
  );
};
