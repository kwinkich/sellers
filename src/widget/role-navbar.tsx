import { useUserRole } from "@/shared";
import { AdminNavBar, ClientNavBar, MopNavBar } from "@/widget";

export const RoleNavBar = () => {
  const { role } = useUserRole();

  switch (role) {
    case "ADMIN":
      return <AdminNavBar />;
    case "MOP":
      return <MopNavBar />;
    case "CLIENT":
    default:
      return <ClientNavBar />;
  }
};
