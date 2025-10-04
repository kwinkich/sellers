import type { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
	icon: ReactNode;
	route: string;
	label: string;
	isActive: boolean;
}

export const NavItem: FC<{ data: Props }> = ({ data }) => {
	const navigate = useNavigate();
	return (
		<div
			className={`flex flex-col items-center gap-1 w-[72px] ${
				data.isActive ? "text-base-main  " : "text-base-gray"
			}`}
			onClick={() => navigate(data.route)}
		>
			{data.icon}
			<p
				className={`text-[10px] font-medium leading-[100%] ${
					!data.isActive ? "text-base-gray" : "text-base-main"
				}`}
			>
				{data.label}
			</p>
		</div>
	);
};
