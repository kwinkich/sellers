import { AdminNavBar } from "@/widget";
import { Outlet } from "react-router-dom";

export const AdminLayout = () => {
	return (
		<div className="w-dvw h-dvh bg-white relative">
			<div className="w-full h-full overflow-auto pb-24">
				<Outlet />
			</div>
			<AdminNavBar />
		</div>
	);
};
