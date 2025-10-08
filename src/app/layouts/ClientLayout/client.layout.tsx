import { ClientNavBar } from "@/widget";
import { Outlet } from "react-router-dom";

export const ClientLayout = () => {
	return (
		<div className="w-dvw h-dvh bg-white relative">
			<div className="w-full h-full overflow-auto pb-16">
				<Outlet />
			</div>
			<ClientNavBar />
		</div>
	);
};
