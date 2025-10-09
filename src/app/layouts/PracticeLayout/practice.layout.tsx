import { Outlet } from "react-router-dom";
import { RoleNavBar } from "@/widget";

export const PracticeLayout = () => {
  return (
		<div className="bg-white relative">
			<div className="w-full h-full pb-16">
				<Outlet />
			</div>
			<RoleNavBar />
		</div>
  );
};


