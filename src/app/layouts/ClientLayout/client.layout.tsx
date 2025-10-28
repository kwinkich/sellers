import { ClientNavBar } from "@/widget";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserRole } from "@/shared";
import { useEffect } from "react";

export const ClientLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useUserRole();

  // Redirect non-CLIENT users to their appropriate home
  useEffect(() => {
    if (role && role !== "CLIENT") {
      const routes = {
        ADMIN: "/admin/home",
        MOP: "/mop/home",
      } as const;
      const targetRoute = routes[role as keyof typeof routes];
      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [role, navigate]);

  // Apply bg-second-bg for mops, courses, and practice pages, but not for home
  const shouldApplySecondBg =
    location.pathname.includes("/client/list-mop") ||
    location.pathname.includes("/client/mop/") ||
    location.pathname.includes("/client/courses") ||
    location.pathname.includes("/practice");

  return (
    <div className="w-dvw h-dvh bg-white relative">
      <div
        className={`w-full h-full overflow-auto ${
          shouldApplySecondBg ? "bg-second-bg" : ""
        }`}
        data-scroll-container
        style={{
          paddingBottom:
            "calc(var(--nav-h, 64px) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Outlet />
      </div>
      <ClientNavBar />
    </div>
  );
};
