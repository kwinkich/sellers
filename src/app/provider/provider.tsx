import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";

const qc = new QueryClient();

export const Provider: FC<PropsWithChildren> = ({ children }) => {
	return (
		<QueryClientProvider client={qc}>
			<Toaster />
			{children}
		</QueryClientProvider>
	);
};
