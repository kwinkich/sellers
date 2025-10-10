import { ClientNavBar } from "@/widget";
import { Outlet, useLocation } from "react-router-dom";

export const ClientLayout = () => {
	const location = useLocation();

	// Apply bg-second-bg for mops and practice pages, but not for home
	const shouldApplySecondBg =
		location.pathname.includes("/client/list-mop") ||
		location.pathname.includes("/client/mop/") ||
		location.pathname.includes("/practice");

	return (
		<div className="w-dvw h-dvh bg-white relative">
			<div className={`w-full h-full overflow-auto pb-16 ${shouldApplySecondBg ? 'bg-second-bg' : ''}`}>
				<Outlet />
			</div>
			<ClientNavBar />
		</div>
	);
};
