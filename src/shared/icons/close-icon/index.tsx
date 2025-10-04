import type { FC } from "react";
import type { Icon } from "../types/icon.types";

export const CloseIcon: FC<Icon> = ({
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
		>
			<path
				d="M8.4 17.0004L7 15.6004L10.6 12.0004L7 8.42539L8.4 7.02539L12 10.6254L15.575 7.02539L16.975 8.42539L13.375 12.0004L16.975 15.6004L15.575 17.0004L12 13.4004L8.4 17.0004Z"
				fill={fill}
			/>
		</svg>
	);
};
