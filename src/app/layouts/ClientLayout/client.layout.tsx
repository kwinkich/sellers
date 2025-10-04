import { ClientNavBar } from "@/widget";
import { Outlet } from "react-router-dom";

export const ClientLayout = () => {
	return (
		<div className="w-dvw h-dvh bg-white">
			<Outlet />
			<ClientNavBar />
		</div>
	);
};
