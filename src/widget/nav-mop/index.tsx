import { AcademyIcon, MainIcon, NavItem, PracticeIcon } from "@/shared";
import { useLocation } from "react-router-dom";
import { useUiChrome } from "@/shared";

export const MopNavBar = () => {
  const location = useLocation();
  const isHidden = useUiChrome((s) => s.isNavHidden);

  return (
    <div
      className="fixed left-0 right-0 z-50 rounded-t-3xl bg-black
                 transition-[opacity,transform] ease-out duration-100
                 will-change-transform"
      style={{
        bottom: 0,
        // bar height includes the safe area (no padding here)
        height: "calc(var(--nav-h, 80px) + env(safe-area-inset-bottom, 0px))",
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? "none" : "auto",
        // big translate moves it fully off-screen when iOS tries to hoist fixed elements
        transform: isHidden ? "translateY(120%)" : "translateY(0)",
        // perf niceties
        backfaceVisibility: "hidden",
        contain: "layout paint",
      }}
      aria-hidden={isHidden}
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
            route: "/mop/home",
            icon: <MainIcon size={20} />,
            label: "Профиль",
            isActive: location.pathname.includes("mop/home"),
          }}
        />

        <NavItem
          data={{
            route: "/mop/education/courses",
            icon: <AcademyIcon size={20} />,
            label: "Академия",
            isActive: location.pathname.includes("mop/education/courses"),
          }}
        />

        <NavItem
          data={{
            route: "/practice",
            icon: <PracticeIcon size={20} />,
            label: "Практика",
            isActive: location.pathname.includes("practice"),
          }}
        />
      </div>
    </div>
  );
};
