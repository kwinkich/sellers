import { AdminNavBar } from "@/widget";
import { Outlet, useLocation } from "react-router-dom";

export const AdminLayout = () => {
  const location = useLocation();

  // Define routes that should have dark backgrounds (list/management pages)
  const darkBackgroundRoutes = [
    "/admin/clients",
    "/admin/cases",
    "/admin/scenarios",
    "/admin/courses/list",
    "/admin/list", // admins control
  ];

  // Check if current route should have dark background
  // Exclude create routes from dark background
  const shouldHaveDarkBackground = darkBackgroundRoutes.some(
    (route) =>
      location.pathname.startsWith(route) &&
      !location.pathname.includes("/create")
  );

  const backgroundClass = shouldHaveDarkBackground
    ? "bg-second-bg"
    : "bg-white";

  return (
    <div className="w-dvw h-dvh bg-white relative">
      <div className={`w-full h-full overflow-auto pb-16 ${backgroundClass}`}>
        <Outlet />
      </div>
      <AdminNavBar />
    </div>
  );
};
