import type { FC } from "react";
import type { Icon } from "../types/icon.types";

export const LinkIcon: FC<Icon> = ({
	fill = "currentColor",
	size = 18,
	cn = "",
}) => {
	return (
		<svg
			width={size}
			height={size}
			className={cn}
			viewBox="0 0 18 19"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M4.8 14L3.75 12.95L10.95 5.75H4.5V4.25H13.5V13.25H12V6.8L4.8 14Z"
				fill={fill}
			/>
		</svg>
	);
};
