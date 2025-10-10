import { Outlet, useLocation } from "react-router-dom";
import { RoleNavBar } from "@/widget";

export const PracticeLayout = () => {
  const location = useLocation();

  const shouldApplySecondBg =
		location.pathname.includes("/practice/create") ||
		location.pathname.includes("/practice/preview");
  return (
		<div className="bg-white">
			<div className={`w-full h-full ${shouldApplySecondBg ? "pb-0" : "pb-16"} bg-second-bg`}>
				<Outlet />
			</div>
			{<RoleNavBar />}
		</div>
  );
};


