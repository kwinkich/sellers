import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
	"h-16 pl-4 pr-2 rounded-2xl placeholder:text-second-gray text-sm font-medium w-full min-w-0 transition-[color,box-shadow] outline-none  disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: "bg-white-gray",
				dark: "bg-base-bg text-white placeholder:text-base-gray",
				second: "bg-second-bg text-white placeholder:text-base-gray",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

function Input({
	className,
	variant,
	type,
	...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(inputVariants({ variant, className }))}
			{...props}
		/>
	);
}

export { Input };
