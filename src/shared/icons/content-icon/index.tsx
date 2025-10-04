import type { FC } from "react";
import type { Icon } from "../types/icon.types";

export const ContentIcon: FC<Icon> = ({
	fill = "currentColor",
	size = 18,
	cn = "",
}) => {
	return (
		<svg
			width={size}
			height={size}
			className={cn}
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M5.25 15V3H12.75V15H5.25ZM2.25 13.5V4.5H3.75V13.5H2.25ZM14.25 13.5V4.5H15.75V13.5H14.25ZM6.75 13.5H11.25V4.5H6.75V13.5Z"
				fill={fill}
			/>
		</svg>
	);
};
