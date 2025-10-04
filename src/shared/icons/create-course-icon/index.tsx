import type { FC } from "react";
import type { Icon } from "../types/icon.types";

export const CreateCourseIcon: FC<Icon> = ({
	fill = "currentColor",
	size = 18,
	cn = "",
}) => {
	return (
		<svg
			width={size}
			height={size}
			className={cn}
			viewBox="0 0 37 37"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M9.5 33.5C8.675 33.5 7.96875 33.2063 7.38125 32.6188C6.79375 32.0313 6.5 31.325 6.5 30.5V6.5C6.5 5.675 6.79375 4.96875 7.38125 4.38125C7.96875 3.79375 8.675 3.5 9.5 3.5H27.5C28.325 3.5 29.0312 3.79375 29.6188 4.38125C30.2063 4.96875 30.5 5.675 30.5 6.5V30.5C30.5 31.325 30.2063 32.0313 29.6188 32.6188C29.0312 33.2063 28.325 33.5 27.5 33.5H9.5ZM9.5 30.5H27.5V6.5H24.5V17L20.75 14.75L17 17V6.5H9.5V30.5Z"
				fill={fill}
			/>
		</svg>
	);
};
