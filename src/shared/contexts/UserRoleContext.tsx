import { createContext, useContext, type ReactNode } from "react";

type UserAppRole = "CLIENT" | "ADMIN" | "MOP";

interface UserRoleContextType {
  role: UserAppRole | null;
  userId: number | null;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  userId: null,
});

export const UserRoleProvider = ({
  children,
  role,
  userId,
}: {
  children: ReactNode;
  role: UserAppRole | null;
  userId: number | null;
}) => {
  return (
    <UserRoleContext.Provider value={{ role, userId }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
};

export type { UserAppRole };
