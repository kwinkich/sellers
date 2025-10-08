import { Outlet } from "react-router-dom";
import { RoleNavBar } from "@/widget";

export const PracticeLayout = () => {
  return (
    <div className="w-dvw h-dvh bg-white">
      <Outlet />
      <RoleNavBar />
    </div>
  );
};


