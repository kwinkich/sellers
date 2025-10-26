import { AcademyIcon, MainIcon, NavItem, PracticeIcon } from "@/shared";
import { useLocation } from "react-router-dom";

export const MopNavBar = () => {
  const location = useLocation();

  return (
    <div className="w-full flex items-center justify-center h-16 bg-black rounded-t-3xl fixed bottom-0 z-50">
      <NavItem
        data={{
          route: "/mop/home",
          icon: <MainIcon size={18} />,
          label: "Профиль",
          isActive: location.pathname.includes("mop/home"),
        }}
      />

      <NavItem
        data={{
          route: "/mop/education/courses",
          icon: <AcademyIcon size={18} />,
          label: "Академия",
          isActive: location.pathname.includes("mop/education/courses"),
        }}
      />

      <NavItem
        data={{
          route: "/practice",
          icon: <PracticeIcon size={18} />,
          label: "Практика",
          isActive: location.pathname.includes("practice"),
        }}
      />
    </div>
  );
};
