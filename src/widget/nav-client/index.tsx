import { ClientIcon, MainIcon, NavItem, PracticeIcon } from "@/shared";
import { useLocation } from "react-router-dom";

export const ClientNavBar = () => {
	const location = useLocation();

	return (
		<div className="w-full flex items-center justify-center py-6 bg-black rounded-t-3xl fixed bottom-0 z-50">
			<NavItem
				data={{
					route: "/client/home",
					icon: <MainIcon size={18} />,
					label: "Главная",
					isActive: location.pathname.includes("client/home"),
				}}
			/>

			<NavItem
				data={{
					route: "/client/list-mop",
					icon: <ClientIcon size={18} />,
					label: "МОП",
					isActive: location.pathname.includes("client/list-mop"),
				}}
			/>

			<NavItem
				data={{
					route: "/practice",
					icon: <PracticeIcon size={18} />,
					label: "Практика",
					isActive: location.pathname.includes("practice"),
				}}
			/>
		</div>
	);
};
