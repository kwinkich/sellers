import { MopNavBar } from "@/widget";
import { Outlet } from "react-router-dom";

export const MopLayout = () => {
  return (
    <div className="w-dvw h-dvh bg-white relative">
      <div className="w-full h-full overflow-auto pb-16 bg-second-bg">
        <Outlet />
      </div>
      <MopNavBar />
    </div>
  );
};
