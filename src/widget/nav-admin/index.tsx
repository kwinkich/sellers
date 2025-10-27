import {
  ClientIcon,
  ContentIcon,
  MainIcon,
  NavItem,
  PracticeIcon,
  useKeyboardVisibility,
} from "@/shared";
import { useLocation } from "react-router-dom";

export const AdminNavBar = () => {
  const location = useLocation();
  const { isKeyboardVisible } = useKeyboardVisibility();

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
    <div
      className="fixed left-0 right-0 z-50 rounded-t-3xl bg-black
                 transition-[opacity,transform] ease-out duration-100
                 will-change-transform"
      style={{
        bottom: 0,
        // bar height includes the safe area (no padding here)
        height: "calc(var(--nav-h, 80px) + env(safe-area-inset-bottom, 0px))",
        opacity: isKeyboardVisible ? 0 : 1,
        pointerEvents: isKeyboardVisible ? "none" : "auto",
        // big translate moves it fully off-screen when iOS tries to hoist fixed elements
        transform: isKeyboardVisible ? "translateY(120%)" : "translateY(0)",
        // perf niceties
        backfaceVisibility: "hidden",
        contain: "layout paint",
      }}
      aria-hidden={isKeyboardVisible}
    >
      <div
        className="flex items-center justify-around px-4"
        style={{
          // icons are vertically centered inside the visual 80px area
          height: "var(--nav-h, 80px)",
          // put the safe area BELOW content so it doesn't skew centering
          marginBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <NavItem
          data={{
            route: "/admin/home",
            icon: <MainIcon size={20} />,
            label: "Главная",
            isActive: isHomeActive,
          }}
        />

        <NavItem
          data={{
            route: "/admin/content/courses",
            icon: <ContentIcon size={20} />,
            label: "Контент",
            isActive: isContentActive,
          }}
        />

        <NavItem
          data={{
            route: "/admin/clients",
            icon: <ClientIcon size={20} />,
            label: "Клиенты",
            isActive: isClientsActive,
          }}
        />

        <NavItem
          data={{
            route: "/practice",
            icon: <PracticeIcon size={20} />,
            label: "Практика",
            isActive: isPracticeActive,
          }}
        />
      </div>
    </div>
  );
};
