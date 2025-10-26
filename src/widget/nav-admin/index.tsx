import {
  ClientIcon,
  ContentIcon,
  MainIcon,
  NavItem,
  PracticeIcon,
} from "@/shared";
import { useLocation } from "react-router-dom";

export const AdminNavBar = () => {
  const location = useLocation();

  return (
    <div className="w-full flex items-center justify-center h-16 bg-black rounded-t-3xl fixed bottom-0 z-50">
      <NavItem
        data={{
          route: "/admin/home",
          icon: <MainIcon size={18} />,
          label: "Главная",
          isActive: location.pathname.includes("admin/home"),
        }}
      />

      <NavItem
        data={{
          route: "/admin/courses/list",
          icon: <ContentIcon size={18} />,
          label: "Контент",
          isActive: ["course", "cases", "lessons", "modukes", "scenarios"].some(
            (path) => location.pathname.includes(path)
          ),
        }}
      />

      <NavItem
        data={{
          route: "/admin/clients",
          icon: <ClientIcon size={18} />,
          label: "Клиенты",
          isActive: location.pathname.includes("clients"),
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
