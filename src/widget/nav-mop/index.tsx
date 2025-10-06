import { AcademyIcon, MainIcon, NavItem, PracticeIcon } from "@/shared";
import { useLocation } from "react-router-dom";

export const MopNavBar = () => {
	const location = useLocation();

	return (
		<div className="w-full flex items-center justify-center py-6 bg-base-bg rounded-t-3xl fixed bottom-0">
			<NavItem
				data={{
					route: "/mop/profile",
					icon: <MainIcon />,
					label: "Профиль",
					isActive: location.pathname.includes("mop/profile"),
				}}
			/>

			<NavItem
				data={{
					route: "/mop/academy",
					icon: <AcademyIcon />,
					label: "Академия",
					isActive: location.pathname.includes("mop/academy"),
				}}
			/>

			<NavItem
				data={{
					route: "/practice",
					icon: <PracticeIcon />,
					label: "Практика",
					isActive: location.pathname.includes("practice"),
				}}
			/>
		</div>
	);
};
