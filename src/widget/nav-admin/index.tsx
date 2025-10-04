import { ClientIcon, MainIcon, NavItem, PracticeIcon } from "@/shared";
import { useLocation } from "react-router-dom";

export const AdminNavBar = () => {
	const location = useLocation();

	return (
		<div className="w-full flex items-center justify-center py-6 bg-base-bg rounded-t-3xl fixed bottom-0">
			<NavItem
				data={{
					route: "/client/home",
					icon: <MainIcon />,
					label: "Главная",
					isActive: location.pathname.includes("client/home"),
				}}
			/>

			<NavItem
				data={{
					route: "/client/mop",
					icon: <ClientIcon />,
					label: "МОП",
					isActive: location.pathname.includes("client/mop"),
				}}
			/>

			<NavItem
				data={{
					route: "/client/practice",
					icon: <PracticeIcon />,
					label: "Практика",
					isActive: location.pathname.includes("client/mop"),
				}}
			/>
		</div>
	);
};
