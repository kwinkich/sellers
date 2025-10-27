import { Outlet, useLocation } from "react-router-dom";
import { RoleNavBar } from "@/widget";

export const PracticeLayout = () => {
  const location = useLocation();

  const shouldApplySecondBg =
    location.pathname.includes("/practice/create") ||
    location.pathname.includes("/practice/preview");
  return (
    <div className="bg-white">
      <div
        className={`w-full h-full bg-second-bg`}
        style={{
          paddingBottom: shouldApplySecondBg
            ? "0px"
            : "calc(var(--nav-h, 64px) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Outlet />
      </div>
      {<RoleNavBar />}
    </div>
  );
};
