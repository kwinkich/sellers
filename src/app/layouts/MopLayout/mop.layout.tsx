import { MopNavBar } from "@/widget";
import { Outlet } from "react-router-dom";

export const MopLayout = () => {
	return (
		<div className="w-dvw h-dvh bg-white">
			<Outlet />
			<MopNavBar />
		</div>
	);
};
