import { AdminNavBar } from "@/widget";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserRole } from "@/shared";
import { useEffect } from "react";

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useUserRole();

  // Redirect non-ADMIN users to their appropriate home
  useEffect(() => {
    if (role && role !== "ADMIN") {
      const routes = {
        CLIENT: "/client/home",
        MOP: "/mop/home",
      } as const;
      const targetRoute = routes[role as keyof typeof routes];
      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [role, navigate]);

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
        data-scroll-container
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
