import { AdminNavBar } from "@/widget";
import { Outlet } from "react-router-dom";

export const AdminLayout = () => {
	return (
		<div className="w-dvw h-dvh bg-white">
			<Outlet />
			<AdminNavBar />
		</div>
	);
};
