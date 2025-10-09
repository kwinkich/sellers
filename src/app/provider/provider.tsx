import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";
import { AlertsHost } from "@/shared/lib/alert.service";

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, 
      refetchOnWindowFocus: false, 
    },
    mutations: {
      retry: 0,
    },
  },
});

export const Provider: FC<PropsWithChildren> = ({ children }) => {
	return (
		<QueryClientProvider client={qc}>
			<Toaster />
			<AlertsHost />
			{children}
		</QueryClientProvider>
	);
};
