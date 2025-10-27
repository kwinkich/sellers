import type { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  icon: ReactNode;
  route: string;
  label: string;
  isActive: boolean;
}

export const NavItem: FC<{ data: Props }> = ({ data }) => {
  const navigate = useNavigate();
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 px-2 py-2 ${
        data.isActive ? "text-base-main" : "text-base-gray"
      }`}
      onClick={() => navigate(data.route, { replace: data.isActive })}
    >
      <div className="flex items-center justify-center">{data.icon}</div>
      <p
        className={`text-[11px] font-medium leading-[100%] text-center ${
          !data.isActive ? "text-base-gray" : "text-base-main"
        }`}
      >
        {data.label}
      </p>
    </div>
  );
};
