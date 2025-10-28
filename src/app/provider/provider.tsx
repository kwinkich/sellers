import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
    mutations: {
      retry: 0,
      throwOnError: false,
    },
  },
});

export const Provider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={qc}>
      <Toaster />
      {children}
    </QueryClientProvider>
  );
};
