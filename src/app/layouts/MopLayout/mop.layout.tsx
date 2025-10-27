import { MopNavBar } from "@/widget";
import { Outlet } from "react-router-dom";

export const MopLayout = () => {
  return (
    <div className="w-dvw h-dvh bg-white relative">
      <div
        className="w-full h-full overflow-auto bg-second-bg"
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
