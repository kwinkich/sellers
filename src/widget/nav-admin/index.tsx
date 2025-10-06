import {
	ClientIcon,
	ContentIcon,
	MainIcon,
	NavItem,
	PracticeIcon,
} from "@/shared";
import { useLocation } from "react-router-dom";

export const AdminNavBar = () => {
	const location = useLocation();

	return (
		<div className="w-full flex items-center justify-center py-6 bg-base-bg rounded-t-3xl fixed bottom-0 z-50">
			<NavItem
				data={{
					route: "/admin/home",
					icon: <MainIcon />,
					label: "Главная",
					isActive: location.pathname.includes("admin/home"),
				}}
			/>

			<NavItem
				data={{
					route: "/admin/content",
					icon: <ContentIcon />,
					label: "Контент",
					isActive: location.pathname.includes("admin/content"),
				}}
			/>

			<NavItem
				data={{
					route: "/admin/clients",
					icon: <ClientIcon />,
					label: "Клиенты",
					isActive: location.pathname.includes("admin/clients"),
				}}
			/>

			<NavItem
				data={{
					route: "practice",
					icon: <PracticeIcon />,
					label: "Практика",
					isActive: location.pathname.includes("practice"),
				}}
			/>
		</div>
	);
};
