import { Outlet } from "react-router-dom";
import { RoleNavBar } from "@/widget";

export const PracticeLayout = () => {
  return (
		<div className="w-dvw h-dvh bg-white relative">
			<div className="w-full overflow-auto pb-16">
				<Outlet />
			</div>
			<RoleNavBar />
		</div>
  );
};


