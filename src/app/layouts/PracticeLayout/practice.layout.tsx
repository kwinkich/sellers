import { Outlet, useLocation } from "react-router-dom";
import { RoleNavBar } from "@/widget";

export const PracticeLayout = () => {
  const location = useLocation();
  const isCreatePage = location.pathname.startsWith("/practice/create");
  return (
		<div className="bg-white relative">
			<div className={`w-full h-full ${isCreatePage ? "pb-0" : "pb-16"} bg-second-bg`}>
				<Outlet />
			</div>
			{<RoleNavBar />}
		</div>
  );
};


