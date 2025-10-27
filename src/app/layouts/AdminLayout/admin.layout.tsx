import { AdminNavBar } from "@/widget";
import { Outlet, useLocation } from "react-router-dom";

export const AdminLayout = () => {
  const location = useLocation();

  // Define routes that should have dark backgrounds (list/management pages)
  const darkBackgroundRoutes = [
    "/admin/clients",
    "/admin/content/cases",
    "/admin/content/scenarios",
    "/admin/content/courses",
    "/admin/admins",
  ];

  // Check if current route should have dark background
  // Exclude create routes, edit routes, and detail-edit routes from dark background
  // But include licenses routes (they are list/management pages)
  const shouldHaveDarkBackground =
    darkBackgroundRoutes.some(
      (route) =>
        location.pathname.startsWith(route) &&
        !location.pathname.includes("/create") &&
        !location.pathname.includes("/edit") &&
        !location.pathname.includes("/detail-edit")
    ) || location.pathname.includes("/licenses");

  const backgroundClass = shouldHaveDarkBackground
    ? "bg-second-bg"
    : "bg-white";

  return (
    <div className="w-dvw h-dvh bg-white relative">
      <div
        className={`w-full h-full overflow-auto ${backgroundClass}`}
        style={{
          paddingBottom:
            "calc(var(--nav-h, 64px) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Outlet />
      </div>
      <AdminNavBar />
    </div>
  );
};
