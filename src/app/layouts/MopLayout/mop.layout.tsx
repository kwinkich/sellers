import { MopNavBar } from "@/widget";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserRole } from "@/shared";
import { useEffect } from "react";

export const MopLayout = () => {
  const navigate = useNavigate();
  const { role } = useUserRole();

  // Redirect non-MOP users to their appropriate home
  useEffect(() => {
    if (role && role !== "MOP") {
      const routes = {
        CLIENT: "/client/home",
        ADMIN: "/admin/home",
      } as const;
      const targetRoute = routes[role as keyof typeof routes];
      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [role, navigate]);

  return (
    <div className="w-dvw h-dvh bg-white relative">
      <div
        className="w-full h-full overflow-auto bg-second-bg"
        data-scroll-container
        style={{
          paddingBottom:
            "calc(var(--nav-h, 64px) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Outlet />
      </div>
      <MopNavBar />
    </div>
  );
};
