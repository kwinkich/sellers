import {
  AcademyIcon,
  ClientIcon,
  MainIcon,
  NavItem,
  PracticeIcon,
} from "@/shared";
import { useLocation } from "react-router-dom";

export const ClientNavBar = () => {
  const location = useLocation();

  return (
    <div className="w-full flex items-center justify-center h-16 bg-black rounded-t-3xl fixed bottom-0 left-0 right-0 z-50">
      <NavItem
        data={{
          route: "/client/home",
          icon: <MainIcon size={18} />,
          label: "Главная",
          isActive: location.pathname.includes("client/home"),
        }}
      />

      <NavItem
        data={{
          route: "/client/list-mop",
          icon: <ClientIcon size={18} />,
          label: "МОПы",
          isActive: location.pathname.includes("client/list-mop"),
        }}
      />

      <NavItem
        data={{
          route: "/client/courses",
          icon: <AcademyIcon size={18} />,
          label: "Академия",
          isActive: location.pathname.includes("client/courses"),
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
