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

  // Define which routes should show each tab as active
  const isContentActive = location.pathname.includes("/admin/content");
  const isClientsActive = location.pathname.includes("clients");
  const isPracticeActive = location.pathname.includes("practice");

  // Home tab is active for admin/home or when no other tab is active
  const isHomeActive =
    location.pathname.includes("admin/home") ||
    (!isContentActive &&
      !isClientsActive &&
      !isPracticeActive &&
      location.pathname.startsWith("/admin"));

  return (
    <div className="w-full flex items-center justify-center h-16 bg-black rounded-t-3xl fixed bottom-0 z-50">
      <NavItem
        data={{
          route: "/admin/home",
          icon: <MainIcon size={18} />,
          label: "Главная",
          isActive: isHomeActive,
        }}
      />

      <NavItem
        data={{
          route: "/admin/content/courses",
          icon: <ContentIcon size={18} />,
          label: "Контент",
          isActive: isContentActive,
        }}
      />

      <NavItem
        data={{
          route: "/admin/clients",
          icon: <ClientIcon size={18} />,
          label: "Клиенты",
          isActive: isClientsActive,
        }}
      />

      <NavItem
        data={{
          route: "/practice",
          icon: <PracticeIcon size={18} />,
          label: "Практика",
          isActive: isPracticeActive,
        }}
      />
    </div>
  );
};
